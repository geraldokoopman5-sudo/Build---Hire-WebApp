using System.Security.Claims;
using Build_Hire.API.Controllers;
using BuildAndHire.Application.Services;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
using BuildAndHire.Domain.Scheduling;
using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Infrastructure.Data;
using BuildAndHire.Infrastructure.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

internal static class JobCalendarChecks
{
    // Called only inside PostgreSqlChecks' disposable integration schema.
    public static async Task RunAsync(BuildAndHireDbContext db, Guid companyId, Guid customerId)
    {
        var today = JobCalendar.Today(DateTime.UtcNow);
        Jobs Fixture(JobEnum status) => new()
        {
            JobId = Guid.NewGuid(), CompanyId = companyId, CustomerId = customerId,
            JobDescription = "Calendar counter fixture", Status = status,
            StartDate = today.AddDays(-2), EndDate = today.AddDays(-1), DaysWorking = 999,
            Quote = 1, QuoteSentAt = DateTime.UtcNow, QuoteAcceptedAt = DateTime.UtcNow,
            address = new Address { StreetAddress = "12 Test Road", Suburb = "Central", City = "Cape Town", Province = "Western Cape", PostalCode = 8001 }
        };
        var completed = Fixture(JobEnum.InProgress);
        var cancelled = Fixture(JobEnum.Accepted);
        var rejected = Fixture(JobEnum.Requested);
        var future = Fixture(JobEnum.InProgress);
        future.StartDate = today.AddDays(2);
        future.EndDate = today.AddDays(3);
        db.Jobs.AddRange(completed, cancelled, rejected, future);
        await db.SaveChangesAsync();
        var service = new JobService(new JobRepository(db));
        var controller = new JobsController(service, db)
        { ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() } };
        void As(string role, Guid id) => controller.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.Role, role), new Claim(ClaimTypes.NameIdentifier, id.ToString())
        ], "calendar-test"));
        void Require(bool condition, string message)
        {
            if (!condition) throw new Exception("FAILED: " + message);
            Console.WriteLine("PASS: " + message);
        }

        Require((await service.GetJobByIdAsync(completed.JobId))?.DaysWorking == 3
            && (await service.GetJobByIdAsync(future.JobId))?.DaysWorking == 0,
            "Persisted active jobs use the scheduled start, including overdue and future jobs");
        As("Company", companyId);
        Require(await controller.CompleteJob(completed.JobId) is OkObjectResult, "Company can close the calendar fixture");
        var stored = await db.Jobs.AsNoTracking().SingleAsync(j => j.JobId == completed.JobId);
        Require(stored.Status == JobEnum.Completed && stored.DaysWorking == 3
            && JobCalendar.DaysWorking(stored, DateTime.UtcNow.AddYears(1)) == 3,
            "Completion persists the final elapsed count and prevents further accrual");
        Require(await controller.CompleteJob(future.JobId) is OkObjectResult
            && (await service.GetJobByIdAsync(future.JobId))?.DaysWorking == 0,
            "Closing before the scheduled start freezes zero days");
        Require(await controller.RejectJob(rejected.JobId) is OkObjectResult
            && (await service.GetJobByIdAsync(rejected.JobId))?.DaysWorking == 0,
            "Rejection clears an arbitrary legacy working-day value");
        As("Customer", customerId);
        Require(await controller.CancelJob(cancelled.JobId) is OkObjectResult,
            "Customer can cancel the calendar fixture");
        var cancelledStored = await db.Jobs.AsNoTracking().SingleAsync(j => j.JobId == cancelled.JobId);
        Require(cancelledStored.Status == JobEnum.Cancelled && cancelledStored.DaysWorking == 3
            && JobCalendar.DaysWorking(cancelledStored, DateTime.UtcNow.AddYears(1)) == 3,
            "Cancellation persists the final elapsed count and prevents further accrual");
        Require(await controller.CancelJob(cancelled.JobId) is OkObjectResult
            && (await service.GetJobByIdAsync(cancelled.JobId))?.DaysWorking == 3,
            "Repeated cancellation preserves the frozen day count");
        var ids = new[] { completed.JobId, cancelled.JobId, rejected.JobId, future.JobId };
        await db.Jobs.Where(j => ids.Contains(j.JobId)).ExecuteDeleteAsync();
    }
}
