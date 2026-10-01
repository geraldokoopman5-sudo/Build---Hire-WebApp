using System.Reflection;
using System.Security.Claims;
using System.Text.Json;
using Build_Hire.API.Controllers;
using Build_Hire.API.Validation;
using BuildAndHire.Application.DTOs.CompanyDto;
using BuildAndHire.Application.DTOs.CustomerDto;
using BuildAndHire.Application.DTOs.JobDto;
using BuildAndHire.Application.DTOs.PaymentsDto;
using BuildAndHire.Application.DTOs.WokerDto;
using BuildAndHire.Application.Interfaces.Repositories;
using BuildAndHire.Application.Interfaces.Repository;
using BuildAndHire.Application.Interfaces.Services;
using BuildAndHire.Application.Services;
using BuildAndHire.Application.Validators.Customers;
using BuildAndHire.Application.Validators.Company;
using BuildAndHire.Application.Validators.Jobs;
using BuildAndHire.Application.Validators.Payments;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Infrastructure.Authentication;
using BuildAndHire.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.DependencyInjection;

var checks = 0;
void Check(bool condition, string name)
{
    if (!condition) throw new Exception("FAILED: " + name);
    Console.WriteLine("PASS: " + name);
    checks++;
}
var json = new JsonSerializerOptions(JsonSerializerDefaults.Web);
var address = new Address { StreetAddress = "12 Main Road", Suburb = "Central", City = "Cape Town", Province = "Western Cape", PostalCode = 8001 };
var password = "A-test-password-123";
var signup = new CreateCustomerDto { CustomerName = "Test Customer", Email = "test@example.test", Password = password, address = address };
var customerValidator = new CreateCutsomerValidator();
Check(customerValidator.Validate(signup).IsValid, "Valid customer signup");
signup.Password = "";
Check(!customerValidator.Validate(signup).IsValid, "Empty password rejected");
signup.Password = password;
var legacy = JsonSerializer.Deserialize<CreateCustomerDto>("{\"passwordHash\":\"ignored\"}", json)!;
Check(!customerValidator.Validate(legacy).IsValid, "Legacy passwordHash cannot bypass password validation");

Customer? persistedCustomer = null;
var customerRepo = Stub<ICustomerRepository>.Create((method, values) => {
    if (method.Name != "CreateCustomerAccount") throw new NotSupportedException(method.Name);
    persistedCustomer = (Customer)values![0]!;
    persistedCustomer.CustomerId = Guid.NewGuid();
    return Task.FromResult(persistedCustomer);
});
var passwords = new PasswordService();
var savedCustomer = await new CustomerService(customerRepo, passwords).AddCustomerAsync(signup);
Check(savedCustomer.CustomerId != Guid.Empty, "Signup returns saved customer ID");
Check(passwords.VerifyPassword(password, persistedCustomer!.PasswordHash), "Customer password is hashed and verifiable");
Check(!JsonSerializer.Serialize(savedCustomer, json).Contains("password", StringComparison.OrdinalIgnoreCase), "Customer response contains no password/hash");

Companies? persistedCompany = null;
var companyRepo = Stub<ICompanyRepository>.Create((method, values) => {
    if (method.Name != "RegisterCompany") throw new NotSupportedException(method.Name);
    persistedCompany = (Companies)values![0]!;
    persistedCompany.CompanyId = Guid.NewGuid();
    return Task.FromResult(persistedCompany);
});
var companySignup = new RegisterCompanyDto { CompanyName = "Test Company", CompanyEmail = "company@example.test", Password = password, RegistrationNumber = "1234567890", TaxNumber = "0123456789", address = address };
Check(new CreateCompanyValidator().Validate(companySignup).IsValid, "Valid company signup");
var savedCompany = await new CompanyService(companyRepo, passwords).RegisterCompanyAsync(companySignup);
Check(savedCompany.CompanyId != Guid.Empty && savedCompany.Status == AccountStatus.Pending, "Company receives real ID and server-controlled Pending status");
Check(passwords.VerifyPassword(password, persistedCompany!.PasswordHash), "Company password is hashed");
Check(!JsonSerializer.Serialize(savedCompany, json).Contains("password", StringComparison.OrdinalIgnoreCase), "Company response contains no password/hash");

var start = DateTime.UtcNow.Date.AddDays(1);
var jobRequest = new RegisterJobDto { CompanyId = Guid.NewGuid(), CustomerId = savedCustomer.CustomerId, JobDescription = "Build a retaining wall", StartDate = start, EndDate = start, DaysWorking = 1, Status = JobEnum.Working, PayingMethod = PaymentMethod.EFT, address = address };
var jobValidator = new RegisterJobvalidator();
Check(jobValidator.Validate(jobRequest).IsValid, "Same-day UTC job is valid");
jobRequest.StartDate = DateTime.SpecifyKind(start, DateTimeKind.Unspecified);
Check(!jobValidator.Validate(jobRequest).IsValid, "Unspecified DateTime rejected before persistence");
jobRequest.StartDate = start;
jobRequest.Status = (JobEnum)99;
Check(!jobValidator.Validate(jobRequest).IsValid, "Invalid job enum rejected");
jobRequest.Status = JobEnum.Working;
jobRequest.EndDate = start.AddDays(-1);
Check(!jobValidator.Validate(jobRequest).IsValid, "End before start rejected");
jobRequest.EndDate = start;
var parsedDate = JsonSerializer.Deserialize<RegisterJobDto>("{\"startDate\":\"2030-01-01T00:00:00Z\",\"customerId\":\"11111111-1111-1111-1111-111111111111\"}", json)!;
Check(parsedDate.StartDate.Kind == DateTimeKind.Utc && parsedDate.CustomerId == Guid.Empty, "UTC JSON binding and client customer ID ignored");
try {
    JsonSerializer.Deserialize<RegisterJobDto>("{\"companyId\":\"summit-structural\"}", json);
    throw new Exception("Slug unexpectedly accepted");
} catch (JsonException) { Check(true, "Slug company ID fails binding"); }

var jobRepo = Stub<IJobRepository>.Create((method, values) => {
    var job = (Jobs)values![0]!;
    job.JobId = Guid.NewGuid();
    return Task.FromResult(job);
});
var savedJob = await new JobService(jobRepo).RegisterJobAsync(jobRequest);
Check(savedJob.PayingMethod == PaymentMethod.EFT && savedJob.JobId != Guid.Empty, "Job creation preserves payment method and saved ID");
Check(JsonSerializer.Serialize(new WorkerDto { WorkerLastName = "Smith" }, json).Contains("workerLastName"), "Correct worker JSON name");
Check(JsonSerializer.Serialize(savedJob, json).Contains("\"quote\"") && JsonSerializer.Serialize(savedJob, json).Contains("\"payingMethod\""), "Correct job JSON names");

Payment? persistedPayment = null;
var paymentRepo = Stub<IPayementRepository>.Create((method, values) => {
    persistedPayment = (Payment)values![0]!;
    persistedPayment.PaymentId = Guid.NewGuid();
    return Task.FromResult(persistedPayment);
});
var paymentRequest = new PayPaymentsDto { JobId = savedJob.JobId, Amount = 10, PaymentMethod = PaymentMethod.EFT };
Check(new PaymentsValidator().Validate(paymentRequest).IsValid, "Payment needs no client timestamp");
var before = DateTime.UtcNow;
var savedPayment = await new PaymentService(paymentRepo).CompletePaymentAsync(paymentRequest);
Check(savedPayment.PaymentDate.Kind == DateTimeKind.Utc && savedPayment.PaymentDate >= before && savedPayment.PaymentDate <= DateTime.UtcNow, "Payment timestamp set by server");
Check(savedPayment.PaymentId != Guid.Empty && savedPayment.Status == PaymentEnum.Pending, "Payment starts Pending and returns saved ID");

var services = new ServiceCollection();
services.AddScoped<IValidator<CreateCustomerDto>, CreateCutsomerValidator>();
using var provider = services.BuildServiceProvider();
var http = new DefaultHttpContext { RequestServices = provider };
var action = new ActionContext(http, new RouteData(), new ActionDescriptor(), new ModelStateDictionary());
var context = new ActionExecutingContext(action, [], new Dictionary<string, object?> { ["dto"] = new CreateCustomerDto() }, new object());
var invoked = false;
await new RequestValidationFilter().OnActionExecutionAsync(context, () => { invoked = true; return Task.FromResult(new ActionExecutedContext(action, [], new object())); });
Check(!invoked && context.Result is BadRequestObjectResult, "Global filter stops invalid requests before service execution");

using var db = new BuildAndHireDbContext(new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql("Host=localhost;Database=unused;Username=unused;Password=unused").Options);
Check(!db.Database.HasPendingModelChanges(), "Migration snapshot matches current EF model");
var sql = db.GetService<IMigrator>().GenerateScript("20260819065858_enumtype", "20260929000000_FixApiPropertyNames");
Check(sql.Contains("RENAME COLUMN") && !sql.Contains("DROP COLUMN"), "Migration renames columns without dropping data");
var ownId = Guid.NewGuid();
var otherId = Guid.NewGuid();
var service = Stub<IJobService>.Create((method, values) => Task.FromResult<IEnumerable<JobDto>>([
    new JobDto { CustomerId = ownId }, new JobDto { CustomerId = otherId }
]));
var controller = new JobsController(service, db) { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
controller.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([
    new Claim(ClaimTypes.NameIdentifier, ownId.ToString()), new Claim(ClaimTypes.Role, "Customer")
], "test"));
var result = (OkObjectResult)await controller.GetAllJobs();
Check(((IEnumerable<JobDto>)result.Value!).Count() == 1, "Customer listing excludes another customer's jobs");
Console.WriteLine($"{checks} regression checks passed.");
if (args.Length == 2 && args[0] == "--postgres-config")
    await PostgreSqlChecks.RunAsync(Path.GetFullPath(args[1]));

public class Stub<T> : DispatchProxy where T : class
{
    public Func<MethodInfo, object?[]?, object?> Handler { get; set; } = null!;
    public static T Create(Func<MethodInfo, object?[]?, object?> handler)
    {
        var proxy = Create<T, Stub<T>>();
        ((Stub<T>)(object)proxy).Handler = handler;
        return proxy;
    }
    protected override object? Invoke(MethodInfo? targetMethod, object?[]? args) => Handler(targetMethod!, args);
}
