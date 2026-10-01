using Build_Hire.API.Startup;
using BuildAndHire.Application.DTOs.AuthDto;
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

internal static class PostgreSqlChecks
{
    public static async Task RunAsync(string configurationPath)
    {
        // Only the connection string is read; no credentials are printed or persisted.
        var configuration = new ConfigurationBuilder().AddJsonFile(configurationPath).Build();
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
            await db.Workers.AddAsync(new Workers { WorkerFirstName = "Test", WorkerLastName = "Surname", CompanyId = company.CompanyId, JobId = job.JobId, WorkerStatus = AccountStatus.Active });
            await db.SaveChangesAsync();
            Require(await db.Workers.AnyAsync(w => w.WorkerLastName == "Surname"), "Renamed worker column accepts writes");
        }
        finally
        {
            // The generated schema contains only this test's fixtures.
            await using var cleanup = new NpgsqlCommand($"DROP SCHEMA \"{schema}\" CASCADE", connection);
            await cleanup.ExecuteNonQueryAsync();
        }
        Console.WriteLine("PostgreSQL integration checks passed; temporary schema removed.");
    }

    private static void Require(bool condition, string message)
    {
        if (!condition) throw new Exception("FAILED: " + message);
        Console.WriteLine("PASS: " + message);
    }
}
