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
           var subject = User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub");
           if (!Guid.TryParse(subject, out var customerId)) return Unauthorized();
           if (request.JobId == Guid.Empty) return BadRequest("A job is required.");
           var reference = request.TransactionReference?.Trim();
           if (reference is { Length: > 100 }) return BadRequest("The bank reference is too long.");

           var job = await context.Jobs.AsNoTracking()
               .SingleOrDefaultAsync(j => j.JobId == request.JobId && j.CustomerId == customerId);
           if (job == null) return NotFound();
           if (job.Quote <= 0) return Conflict("The company has not set a quote yet.");
           if (await context.Payment.AnyAsync(p => p.JobId == job.JobId))
               return Conflict("A payment request already exists for this job.");

           var payment = await service.CompletePaymentAsync(new PayPaymentsDto
           {
               JobId = job.JobId,
               Amount = job.Quote,
               PaymentMethod = PaymentMethod.EFT,
               TransactionReference = reference,
           });
           return CreatedAtAction(nameof(GetPaymentById), new { id = payment.PaymentId }, payment);
       }

       [HttpPatch("{id:guid}/status")]
       [Authorize(Roles = "Admin,SuperAdmin")]
       public async Task<IActionResult> UpdatePaymentStatus(Guid id, PaymentResponseDto request)
       {
           if (request.Status is not (PaymentEnum.Successful or PaymentEnum.Failed))
               return BadRequest("Choose Successful or Failed after checking the transfer.");
           var existing = await context.Payment.AsNoTracking().SingleOrDefaultAsync(p => p.PaymentId == id);
           if (existing == null) return NotFound();
           if (existing.Status != PaymentEnum.Pending)
               return Conflict("Only pending payment requests can be reviewed.");
           return Ok(await service.PaymentResponseAsync(id, request));
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
