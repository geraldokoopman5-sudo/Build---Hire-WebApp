using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CustomerController(ICustomerService service, 
                                BuildAndHireDbContext db) : ControllerBase
    {
        private bool CanAccess(Guid id)
        {
            if(User.IsInRole("Admin") ||
            User.IsInRole("SuperAdmin"))
            return true;

            var subject = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
     return User.IsInRole("Customer") &&
               Guid.TryParse(subject, out var accountId) &&
               accountId == id;

        }

        [HttpGet]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetAllCustomerAccounts()
        {
            return Ok(await service.GetAllCustomersAsync());
        }

        [HttpGet("{Id:guid}")]
        public async Task<IActionResult>GetCustomersById(Guid id)
        {
          if(!CanAccess(id)) return NotFound();

          var customer = await service.GetCustomersByIdAsync(id);

          return customer == null ?  NotFound() : Ok(customer);

        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> AddNewCustomer(CreateCustomerDto dto)
        {
            var customer = await service.AddCustomerAsync(dto);

            return CreatedAtAction(nameof(GetCustomersById), new {id = customer.CustomerId}, customer);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateCustomerDetails(Guid id, UpdateCustomerDto dto)
        {
                if(!CanAccess(id)) return NotFound();

                var updated = await service.UpdateCustomerDto(id, dto);
                return updated == null ? NotFound() : Ok(updated);
        }

        [HttpPatch("{id:guid}/status")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> UpdateCustomerStatus(Guid id, UpdateCompanyStatusDto dto)
        {
            if (dto.Status is not (AccountStatus.Active or AccountStatus.InActive or AccountStatus.Deleted))
                return BadRequest("Invalid customer status.");
            var customer = await db.Customers.FindAsync(id);
            if (customer == null) return NotFound();
            customer.Status = dto.Status;
            await db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult>DeleteCustomerAccount(Guid id)
        {
            if(!CanAccess(id)) return NotFound();

            if(!await db.Customers.AnyAsync(c => c.CustomerId == id))
            return NotFound();


            if(await db.Jobs.AnyAsync(j => j.CustomerId == id))
            return Conflict(
                "This customer has jobs. Resolve those jobs before deleting the account.");

                return Ok (await service.DeleteCustomerAccountAsync(id));  
        }
    }
}
