using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController(IPaymentService service, BuildAndHireDbContext context) : ControllerBase
    {
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
}
