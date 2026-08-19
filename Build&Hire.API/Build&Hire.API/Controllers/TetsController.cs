using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TetsController : ControllerBase
    {
        [HttpGet("any-user")]
        [Authorize]
        public IActionResult AnyUser()
        {
            return Ok(new
            {
                Message = "You are authenticated."
            });
        }

        [HttpGet("company")]
        [Authorize(Roles = nameof(AccountType.Company))]
        public IActionResult CompanyOnly()
        {
            return Ok(new
            {
                Message = "You are a Company."
            });
        }

        [HttpGet("customer")]
        [Authorize(Roles = nameof(AccountType.Customer))]
        public IActionResult CustomerOnly()
        {
            return Ok(new
            {
                Message = "You are a Customer."
            });
        }

        [HttpGet("admin")]
        [Authorize(Roles = nameof(AccountType.Admin))]
        public IActionResult AdminOnly()
        {
            return Ok(new
            {
                Message = "You are an Admin."
            });
        }

        [HttpGet("super-admin")]
        [Authorize(Roles = nameof(AdminEnums.SuperAdmin))]
        public IActionResult SuperAdminOnly()
        {
            return Ok(new
            {
                Message = "You are a Super Admin."
            });
        }
    }
}
