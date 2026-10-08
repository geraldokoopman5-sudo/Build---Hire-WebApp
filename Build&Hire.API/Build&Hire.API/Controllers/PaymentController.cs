using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BuildAndHire.Application.DTOs.PaymentsDto;
using BuildAndHire.Domain.Enums;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController(IPaymentService service, BuildAndHireDbContext context) : ControllerBase
    {
       [HttpPost("eft")]
       [Authorize(Roles = "Customer")]
       public async Task<IActionResult> RequestEftPayment(EftPaymentRequest request)
       {
           await using var transaction = await context.Database.BeginTransactionAsync();
           var subject = User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub");
           if (!Guid.TryParse(subject, out var customerId)) return Unauthorized();
           if (request.JobId == Guid.Empty) return BadRequest("A job is required.");
           var reference = request.TransactionReference?.Trim();
           if (reference is { Length: > 100 }) return BadRequest("The simulated transaction reference is too long.");

           var job = await context.Jobs.FromSqlInterpolated($"SELECT * FROM \"Jobs\" WHERE \"JobId\" = {request.JobId} FOR UPDATE")
               .AsNoTracking().SingleOrDefaultAsync(j => j.CustomerId == customerId);
           if (job == null) return NotFound();
           if (job.Quote <= 0) return Conflict("The company has not set a quote yet.");
           if (job.QuoteAcceptedAt == null) return Conflict("Accept the company's quote before requesting a simulated payment.");
           if (job.Status is not (JobEnum.Accepted or JobEnum.InProgress or JobEnum.Completed))
               return Conflict("This job cannot receive payment requests in its current status.");
           if (await context.Payment.AnyAsync(p => p.JobId == job.JobId))
               return Conflict("A payment request already exists for this job.");

           var payment = await service.CompletePaymentAsync(new PayPaymentsDto
           {
               JobId = job.JobId,
               Amount = job.Quote,
               PaymentMethod = PaymentMethod.EFT,
               TransactionReference = reference,
           });
           await context.Jobs.Where(j => j.JobId == job.JobId)
               .ExecuteUpdateAsync(update => update.SetProperty(j => j.PayingMethod, (PaymentMethod?)PaymentMethod.EFT));
           await transaction.CommitAsync();
           return CreatedAtAction(nameof(GetPaymentById), new { id = payment.PaymentId }, payment);
       }

       [HttpPatch("{id:guid}/status")]
       [Authorize(Roles = "Admin,SuperAdmin")]
       public async Task<IActionResult> UpdatePaymentStatus(Guid id, PaymentResponseDto request)
       {
           if (request.Status is not (PaymentEnum.Successful or PaymentEnum.Failed))
               return BadRequest("Choose Successful or Failed for this simulated payment.");
           // Compare and update in one SQL statement: competing reviews cannot overwrite a final outcome.
           var changed = await context.Payment.Where(p => p.PaymentId == id && p.Status == PaymentEnum.Pending)
               .ExecuteUpdateAsync(update => update.SetProperty(p => p.Status, request.Status));
           if (changed == 0)
               return await context.Payment.AnyAsync(p => p.PaymentId == id)
                   ? Conflict("Only pending simulated payments can be reviewed.") : NotFound();

           // Synchronize any tracked fixture/entity when a caller reuses its DbContext.
           var tracked = context.ChangeTracker.Entries<BuildAndHire.Domain.Models.Payment>()
               .SingleOrDefault(entry => entry.Entity.PaymentId == id);
           if (tracked != null) await tracked.ReloadAsync();
           return Ok(new PaymentResponseDto { Status = request.Status });
       }

       [HttpGet]
        [Authorize(Roles ="Admin,SuperAdmin")]
        public async Task<IActionResult> GetAllPayments()
        {
            return Ok(await service.GetAllPaymentsAsync());
        }

      [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPaymentById(Guid id)
    {
        var owner = await context.Payment
            .AsNoTracking()
            .Where(payment => payment.PaymentId == id)
            .Select(payment => new
            {
                payment.Job.CustomerId,
                payment.Job.CompanyId
            })
            .SingleOrDefaultAsync();

        if (owner == null) return NotFound();

        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        var isAdmin = User.IsInRole("Admin") ||
                      User.IsInRole("SuperAdmin");

        var ownsPayment =
            Guid.TryParse(subject, out var accountId) &&
            (
                User.IsInRole("Customer") &&
                owner.CustomerId == accountId ||
                User.IsInRole("Company") &&
                owner.CompanyId == accountId
            );

        if (!isAdmin && !ownsPayment) return NotFound();

        return Ok(await service.GetPaymentsByIdAsync(id));
    }
    }

    public sealed class EftPaymentRequest
    {
        public Guid JobId { get; set; }
        public string? TransactionReference { get; set; }
    }
}
