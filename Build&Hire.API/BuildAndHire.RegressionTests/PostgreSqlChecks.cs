using Build_Hire.API.Startup;
using Build_Hire.API.Controllers;
using BuildAndHire.Application.DTOs.WokerDto;
using BuildAndHire.Application.DTOs.AuthDto;
using BuildAndHire.Application.DTOs.AdminDto;
using BuildAndHire.Application.DTOs.CompanyDto;
using BuildAndHire.Application.DTOs.CustomerDto;
using BuildAndHire.Application.DTOs.JobDto;
using BuildAndHire.Application.DTOs.PaymentsDto;
using BuildAndHire.Application.Interfaces.Services;
using BuildAndHire.Application.Services;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Infrastructure.Authentication;
using BuildAndHire.Infrastructure.Data;
using BuildAndHire.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

internal static class PostgreSqlChecks
{
    public static async Task RunAsync(string? configurationPath = null)
    {
        // Only the connection string is read; no credentials are printed or persisted.
        var configurationBuilder = new ConfigurationBuilder();
        if (configurationPath is not null)
        {
            configurationBuilder.AddJsonFile(configurationPath);
            configurationBuilder.AddJsonFile(Path.Combine(Path.GetDirectoryName(configurationPath)!, "appsettings.Local.json"), optional: true);
        }
        var configuration = configurationBuilder.AddEnvironmentVariables().Build();
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Missing DefaultConnection.");
        var schema = "integration_" + Guid.NewGuid().ToString("N");
        var scopedConnection = new NpgsqlConnectionStringBuilder(connectionString) { SearchPath = schema, Timeout = 5 };
        await using var connection = new NpgsqlConnection(scopedConnection.ConnectionString);
        await connection.OpenAsync();
        await using (var command = new NpgsqlCommand($"CREATE SCHEMA \"{schema}\"", connection))
            await command.ExecuteNonQueryAsync();
        try
        {
            var options = new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql(scopedConnection.ConnectionString).Options;
            await using var db = new BuildAndHireDbContext(options);
            await db.GetService<IMigrator>().MigrateAsync("20260819065858_enumtype");
            // Confirm actual data survives the column rename, not just generated SQL.
            await using (var command = new NpgsqlCommand("INSERT INTO \"Admin\" (\"AdminId\", \"UserName\", \"Email\", \"PasswordHash\", \"Status\", \"accountType\", \"AdminRole\") VALUES (@id, 'Existing', 'existing@example.test', 'unused', 0, 3, 1)", connection))
            {
                command.Parameters.AddWithValue("id", Guid.NewGuid());
                await command.ExecuteNonQueryAsync();
            }
            await db.Database.MigrateAsync();
            Require(await db.Admin.CountAsync() == 1, "Existing data survives migration");
            await VerifyWorkerMigrationAsync(db);

            var password = "Test-" + Guid.NewGuid().ToString("N");
            var settings = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["BootstrapAdmin:Enabled"] = "true",
                ["BootstrapAdmin:Email"] = "superadmin@example.test",
                ["BootstrapAdmin:Password"] = password,
                ["JwtConfig:Issuer"] = "integration-test",
                ["JwtConfig:Audience"] = "integration-test",
                ["JwtConfig:Key"] = new string('x', 80),
                ["JwtConfig:TokenValidityMins"] = "10"
            }).Build();
            var services = new ServiceCollection();
            services.AddDbContext<BuildAndHireDbContext>(o => o.UseNpgsql(scopedConnection.ConnectionString));
            services.AddScoped<IPasswordService, PasswordService>();
            await using var provider = services.BuildServiceProvider();
            await SuperAdminSeeder.SeedAsync(provider, settings);
            await SuperAdminSeeder.SeedAsync(provider, settings);
            Require(await db.Admin.CountAsync(a => a.AdminRole == AdminEnums.SuperAdmin) == 1, "SuperAdmin bootstrap is idempotent");
            var passwords = new PasswordService();
            var jwt = new JwtService(db, settings, passwords);
            var login = await jwt.AuthenticateUser(new LoginRequestDto { Email = "superadmin@example.test", Password = password });
            Require(login is AdminLoginResponseDto { AdminRole: AdminEnums.SuperAdmin, AccountType: AccountType.Admin }, "Seeded SuperAdmin can log in");

            var address = new Address { StreetAddress = "12 Main Road", Suburb = "Central", City = "Cape Town", Province = "Western Cape", PostalCode = 8001 };
            var customer = await new CustomerService(new CustomerRepository(db), passwords).AddCustomerAsync(new CreateCustomerDto
            {
                CustomerName = "Integration Customer", Email = "customer@example.test", Password = password, address = address
            });
            var company = await new CompanyService(new CompanyRepository(db), passwords).RegisterCompanyAsync(new RegisterCompanyDto
            {
                CompanyName = "Integration Company", CompanyEmail = "company@example.test", Password = password,
                RegistrationNumber = "1234567890", TaxNumber = "0123456789",
                address = new Address { StreetAddress = "13 Main Road", Suburb = "Central", City = "Cape Town", Province = "Western Cape", PostalCode = 8001 }
            });
            Require(customer.CustomerId != Guid.Empty && company.CompanyId != Guid.Empty, "Signup persists real GUIDs in PostgreSQL");
            Require(await jwt.AuthenticateUser(new LoginRequestDto { Email = "customer@example.test", Password = "wrong" }) == null, "Wrong login password is rejected");
            Require(await jwt.AuthenticateUser(new LoginRequestDto { Email = "customer@example.test", Password = password }) is CustomerLoginResponseDto, "Registered customer can log in");
            var customerEntity = await db.Customers.SingleAsync(c => c.CustomerId == customer.CustomerId);
            customerEntity.Status = AccountStatus.InActive;
            await db.SaveChangesAsync();
            Require(await jwt.AuthenticateUser(new LoginRequestDto { Email = "customer@example.test", Password = password }) == null, "Inactive customer cannot log in");
            customerEntity.Status = AccountStatus.Active;
            var companyEntity = await db.Companies.SingleAsync(c => c.CompanyId == company.CompanyId);
            Require(companyEntity.Status == AccountStatus.Pending &&
                await jwt.AuthenticateUser(new LoginRequestDto { Email = "company@example.test", Password = password }) == null,
                "Pending company cannot log in");
            companyEntity.Status = AccountStatus.Active;
            await db.SaveChangesAsync();
            Require(await jwt.AuthenticateUser(new LoginRequestDto { Email = "company@example.test", Password = password }) is CompanyLoginResponseDto,
                "Approved company can log in");
            var adminEntity = await db.Admin.SingleAsync(a => a.Email == "superadmin@example.test");
            adminEntity.Status = AccountStatus.Deleted;
            await db.SaveChangesAsync();
            Require(await jwt.AuthenticateUser(new LoginRequestDto { Email = "superadmin@example.test", Password = password }) == null,
                "Deleted admin cannot log in");

            var start = DateTime.UtcNow.Date.AddDays(1);
            var jobs = new JobService(new JobRepository(db));
            var job = await jobs.RegisterJobAsync(new RegisterJobDto
            {
                CompanyId = company.CompanyId, CustomerId = customer.CustomerId, JobDescription = "UTC round trip",
                StartDate = start, EndDate = start.AddDays(2), DaysWorking = 3, Status = JobEnum.Working,
                PayingMethod = PaymentMethod.EFT,
                address = new Address { StreetAddress = "14 Main Road", Suburb = "Central", City = "Cape Town", Province = "Western Cape", PostalCode = 8001 }
            });
            var payment = await new PaymentService(new PaymentRepository(db)).CompletePaymentAsync(new PayPaymentsDto
            { JobId = job.JobId, Amount = 100, PaymentMethod = PaymentMethod.EFT });
            db.ChangeTracker.Clear();
            var storedJob = await db.Jobs.SingleAsync(j => j.JobId == job.JobId);
            var storedPayment = await db.Payment.SingleAsync(p => p.PaymentId == payment.PaymentId);
            Require(storedJob.StartDate == start && storedJob.StartDate.Kind == DateTimeKind.Utc && storedJob.EndDate.Kind == DateTimeKind.Utc, "Job dates round-trip through Npgsql as UTC");
            Require(storedPayment.PaymentDate.Kind == DateTimeKind.Utc && storedPayment.PaymentDate.Year == DateTime.UtcNow.Year, "Payment UTC timestamp persists through Npgsql");
            Require(storedJob.PayingMethod == PaymentMethod.EFT, "Job payment method persists");
            var workerController = new WorkersController(new WorkerService(new WorkerRepository(db)), db)
                { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
            workerController.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([
                new Claim(ClaimTypes.NameIdentifier, company.CompanyId.ToString()),
                new Claim(ClaimTypes.Role, "Company")
            ], "test"));
            var acceptanceController = new JobsController(jobs, db)
                { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
            acceptanceController.HttpContext.User = workerController.HttpContext.User;
            Require(await acceptanceController.AcceptJob(job.JobId) is OkObjectResult,
                "Company accepts job before adding assigned workers");
            var workerResult = await workerController.AddWorker(new AddWorkerDto
            {
                WorkerFirstName = "Test", WorkerLastName = "Surname", WorkerStatus = AccountStatus.Active,
                CompanyId = Guid.NewGuid(), JobId = job.JobId
            });
            Require(workerResult is CreatedAtActionResult { Value: AddWorkerDto created } &&
                created.WorkerId != Guid.Empty && created.CompanyId == company.CompanyId && created.JobId == job.JobId,
                "Worker API ignores spoofed company ID and returns saved IDs");
            Require(await db.Workers.AnyAsync(w => w.WorkerLastName == "Surname" && w.CompanyId == company.CompanyId),
                "Renamed worker column accepts writes");
            Require(await workerController.AddWorker(new AddWorkerDto
            { WorkerFirstName = "Other", WorkerLastName = "Job", JobId = Guid.NewGuid() }) is BadRequestObjectResult,
                "Worker API rejects jobs outside the company");

            var customerController = new CustomerController(new CustomerService(new CustomerRepository(db), passwords), db)
                { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
            customerController.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([
                new Claim(ClaimTypes.Role, "Admin")
            ], "test"));
            Require(await customerController.UpdateCustomerStatus(customer.CustomerId,
                new UpdateCompanyStatusDto { Status = AccountStatus.InActive }) is NoContentResult &&
                await db.Customers.AnyAsync(c => c.CustomerId == customer.CustomerId && c.Status == AccountStatus.InActive),
                "Admin approval API persists customer status");

            var jobsController = new JobsController(new JobService(new JobRepository(db)), db)
                { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
            jobsController.HttpContext.User = workerController.HttpContext.User;
            Require(await jobsController.UpdateJobDetails(job.JobId, new UpdateJobDetailsDto
            {
                Quote = 0, EndDate = storedJob.EndDate, Status = JobEnum.Accepted,
                PayingMethod = PaymentMethod.EFT
            }) is OkObjectResult &&
                await db.Jobs.AnyAsync(j => j.JobId == job.JobId && j.Status == JobEnum.Accepted),
                "Company job details preserve the accepted lifecycle state");
            Require(await jobsController.UpdateJobDetails(job.JobId, new UpdateJobDetailsDto
            {
                Quote = 150, EndDate = storedJob.EndDate, Status = JobEnum.Accepted,
                PayingMethod = PaymentMethod.EFT
            }) is ConflictObjectResult, "Quote cannot change after payment request");
            var unquotedJob = await jobs.RegisterJobAsync(new RegisterJobDto
            {
                CompanyId = company.CompanyId, CustomerId = customer.CustomerId,
                JobDescription = "New quote", StartDate = start, EndDate = start.AddDays(1),
                DaysWorking = 2, Status = JobEnum.Working, PayingMethod = PaymentMethod.EFT,
                address = address
            });
            Require(await jobsController.AcceptJob(unquotedJob.JobId) is OkObjectResult,
                "Company accepts the new job before sending a quote");
            Require(await jobsController.UpdateJobDetails(unquotedJob.JobId, new UpdateJobDetailsDto
            {
                Quote = 150, EndDate = start.AddDays(1), Status = JobEnum.Accepted,
                PayingMethod = PaymentMethod.EFT
            }) is OkObjectResult &&
                await db.Jobs.AnyAsync(j => j.JobId == unquotedJob.JobId && j.Quote == 150),
                "Company quote persists before payment request");
            var paymentController = new PaymentController(new PaymentService(new PaymentRepository(db)), db)
                { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
            paymentController.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, "Customer")
            ], "test"));
            Require(await paymentController.RequestEftPayment(new EftPaymentRequest
            { JobId = unquotedJob.JobId, TransactionReference = "bank-ref" }) is NotFoundResult,
                "Another customer cannot request payment for a job");
            paymentController.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([
                new Claim(ClaimTypes.NameIdentifier, customer.CustomerId.ToString()),
                new Claim(ClaimTypes.Role, "Customer")
            ], "test"));
            jobsController.HttpContext.User = paymentController.HttpContext.User;
            Require(await jobsController.AcceptQuote(unquotedJob.JobId, new JobQuoteRequest { Quote = 150 }) is OkObjectResult,
                "Customer accepts the stored quote before simulated payment");
            var eftResult = await paymentController.RequestEftPayment(new EftPaymentRequest
            { JobId = unquotedJob.JobId, TransactionReference = "bank-ref" });
            Require(eftResult is CreatedAtActionResult { Value: PaymentsDto eft } &&
                eft.Amount == 150 && eft.Status == PaymentEnum.Pending &&
                eft.PaymentMethod == PaymentMethod.EFT &&
                await db.Payment.AnyAsync(p => p.PaymentId == eft.PaymentId && p.TransactionReference == "bank-ref"),
                "EFT request uses the stored quote and remains pending");
            Require(await paymentController.RequestEftPayment(new EftPaymentRequest
            { JobId = unquotedJob.JobId }) is ConflictObjectResult,
                "Duplicate EFT request is rejected");
            paymentController.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([
                new Claim(ClaimTypes.Role, "Admin")
            ], "test"));
            Require(await paymentController.UpdatePaymentStatus(
                ((PaymentsDto)((CreatedAtActionResult)eftResult).Value!).PaymentId,
                new PaymentResponseDto { Status = PaymentEnum.Successful }) is OkObjectResult &&
                await db.Payment.AnyAsync(p => p.JobId == unquotedJob.JobId && p.Status == PaymentEnum.Successful),
                "Admin review confirms a pending EFT");
            Require((await jobs.GetJobByIdAsync(unquotedJob.JobId))?.AmountPaid == 150,
                "Verified EFT is counted as paid");
            var listedJob = (await jobs.GetAllJobsAsync()).Single(j => j.JobId == job.JobId);
            Require(listedJob.PaymentStatus == PaymentEnum.Pending && listedJob.AmountPaid == 0,
                "Pending payment is not counted as paid");

            var updatedCompany = await new CompanyService(new CompanyRepository(db), passwords)
                .UpdateCompanyAsync(company.CompanyId, new UpdateCompanyDto
                {
                    CompanyName = "Renamed Company", CompanyEmail = "renamedcompany@example.test",
                    RegistrationNumber = "1234567890", TaxNumber = "0123456789", address = address
                });
            Require(updatedCompany?.CompanyName == "Renamed Company" &&
                await db.Companies.AnyAsync(c => c.CompanyId == company.CompanyId &&
                    c.CompanyEmail == "renamedcompany@example.test"),
                "Company settings persist through the service and repository");

            var admins = new AdminService(new AdminRepository(db), passwords);
            var createdAdmin = await admins.RegisterAdminAsync(new AddAdmin
            {
                UserName = "ReviewAdmin", Email = "reviewadmin@example.test", Password = password,
                Status = AccountStatus.Active, AdminRole = AdminEnums.Admin
            });
            Require(createdAdmin.AdminId != Guid.Empty, "Super-admin management creates a persisted admin");
            var changedAdmin = await admins.UpdateAdminAsync(createdAdmin.AdminId, new UpdateAdmin
            {
                UserName = "RenamedAdmin", Email = "renamedadmin@example.test",
                Status = AccountStatus.Active, AdminRole = AdminEnums.Admin
            });
            Require(changedAdmin.AdminId == createdAdmin.AdminId && changedAdmin.UserName == "RenamedAdmin" &&
                await db.Admin.AnyAsync(a => a.AdminId == createdAdmin.AdminId && a.Email == "renamedadmin@example.test"),
                "Super-admin management updates name and email");
            await admins.DeleteAdminAsync(createdAdmin.AdminId);
            Require(!await db.Admin.AnyAsync(a => a.AdminId == createdAdmin.AdminId),
                "Super-admin management deletes the selected admin");

            // HTTP checks use the real middleware and only this disposable schema.
            await db.Admin.Where(a => a.Email == "superadmin@example.test")
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.Status, AccountStatus.Active));
            await HttpWorkflowChecks.RunAsync(scopedConnection.ConnectionString, password);
        }
        finally
        {
            // The generated schema contains only this test's fixtures.
            await using var cleanup = new NpgsqlCommand($"DROP SCHEMA \"{schema}\" CASCADE", connection);
            await cleanup.ExecuteNonQueryAsync();
        }
        Console.WriteLine("PostgreSQL integration checks passed; temporary schema removed.");
    }

    private static async Task VerifyWorkerMigrationAsync(BuildAndHireDbContext db)
    {
        // All migration downgrade/upgrade fixtures stay inside the disposable schema.
        static Address FixtureAddress() => new()
        { StreetAddress = "Migration Road", Suburb = "Central", City = "Cape Town", Province = "Western Cape", PostalCode = 8001 };
        var company = new Companies
        {
            CompanyId = Guid.NewGuid(), CompanyName = "Migration Company", CompanyEmail = "migration-company@example.test",
            PasswordHash = "unused", RegistrationNumber = "1234567890", TaxNumber = "0123456789", address = FixtureAddress()
        };
        var customer = new Customer
        { CustomerId = Guid.NewGuid(), CustomerName = "Migration Customer", Email = "migration-customer@example.test", PasswordHash = "unused", address = FixtureAddress() };
        Jobs FixtureJob() => new()
        {
            JobId = Guid.NewGuid(), CompanyId = company.CompanyId, CustomerId = customer.CustomerId,
            JobDescription = "Existing migration job", StartDate = DateTime.UtcNow.Date, EndDate = DateTime.UtcNow.Date,
            DaysWorking = 1, address = FixtureAddress()
        };
        var assignedJob = FixtureJob();
        assignedJob.Quote = 100;
        var emptyJob = FixtureJob();
        emptyJob.Quote = 50;
        var legacyUnavailableJob = FixtureJob();
        legacyUnavailableJob.Status = JobEnum.Unavailable;
        var assignedWorker = new Workers
        { WorkerId = Guid.NewGuid(), WorkerFirstName = "Existing", WorkerLastName = "Assigned", CompanyId = company.CompanyId, JobId = assignedJob.JobId };
        var unassignedWorker = new Workers
        { WorkerId = Guid.NewGuid(), WorkerFirstName = "Existing", WorkerLastName = "Unassigned", CompanyId = company.CompanyId };
        db.AddRange(company, customer, assignedJob, emptyJob, legacyUnavailableJob, assignedWorker, unassignedWorker);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();
        var migrator = db.GetService<IMigrator>();
        var blocked = false;
        try { await migrator.MigrateAsync("20260929000000_FixApiPropertyNames"); }
        catch (PostgresException error) when (error.SqlState == "P0001") { blocked = true; }
        Require(blocked && await db.Workers.AnyAsync(w => w.WorkerId == unassignedWorker.WorkerId && w.JobId == null),
            "Migration rollback refuses to lose unassigned workers");
        Require(!(await db.Database.GetPendingMigrationsAsync()).Any(), "Refused rollback leaves current schema and migration history intact");
        await db.Workers.Where(w => w.WorkerId == unassignedWorker.WorkerId).ExecuteDeleteAsync();
        await migrator.MigrateAsync("20260929000000_FixApiPropertyNames");
        await db.Database.MigrateAsync();
        Require(await db.Workers.AnyAsync(w => w.WorkerId == assignedWorker.WorkerId && w.JobId == assignedJob.JobId),
            "Worker migration preserves existing assignments");
        Require(await db.Jobs.AnyAsync(j => j.JobId == assignedJob.JobId && j.AcceptedAt != null),
            "Worker migration treats already staffed jobs as accepted");
        Require(await db.Jobs.AnyAsync(j => j.JobId == emptyJob.JobId && j.AcceptedAt == null),
            "Worker migration leaves jobs without workers awaiting acceptance");
        Require(await db.Jobs.AnyAsync(j => j.JobId == assignedJob.JobId && j.Status == JobEnum.Accepted && j.QuoteSentAt != null && j.QuoteAcceptedAt == null),
            "Lifecycle migration exposes existing staffed-job quotes without inventing customer consent");
        Require(await db.Jobs.AnyAsync(j => j.JobId == emptyJob.JobId && j.Status == JobEnum.Requested && j.QuoteSentAt != null && j.QuoteAcceptedAt == null)
            && await db.Jobs.AnyAsync(j => j.JobId == legacyUnavailableJob.JobId && j.Status == JobEnum.Cancelled),
            "Lifecycle migration maps existing open and unavailable jobs explicitly");
        await db.Workers.Where(w => w.CompanyId == company.CompanyId).ExecuteDeleteAsync();
        await db.Jobs.Where(j => j.CompanyId == company.CompanyId).ExecuteDeleteAsync();
        await db.Companies.Where(c => c.CompanyId == company.CompanyId).ExecuteDeleteAsync();
        await db.Customers.Where(c => c.CustomerId == customer.CustomerId).ExecuteDeleteAsync();
    }

    private static void Require(bool condition, string message)
    {
        if (!condition) throw new Exception("FAILED: " + message);
        Console.WriteLine("PASS: " + message);
    }
}
