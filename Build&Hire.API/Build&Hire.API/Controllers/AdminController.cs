using BuildAndHire.Application.DTOs.AdminDto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _service;

        public AdminController(IAdminService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = nameof(AdminEnums.SuperAdmin))]
        public async Task<IActionResult> GetAllAdmins()
        {
            var admins = await _service.GetAllAdminsAsync();

            return Ok(admins);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = nameof(AdminEnums.SuperAdmin))]
        public async Task<IActionResult> GetAdminById(Guid id)
        {
            try
            {
                var admin = await _service.GetAdminByIdAsync(id);

                return Ok(admin);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Admin not found");
            }
        }

        [HttpPost]
        [Authorize (Roles = nameof(AdminEnums.SuperAdmin))]
        public async Task<IActionResult> RegisterAdmin(AddAdmin dto)
        {
            var admin = await _service.RegisterAdminAsync(dto);
            return CreatedAtAction(
                    nameof(GetAdminById),
                    new { id = admin.AdminId },
                    admin);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateAdmin(
            Guid id,
            UpdateAdmin dto)
        {
            try
            {
                var admin = await _service.UpdateAdminAsync(id, dto);

                return Ok(admin);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Admin not found");
            }
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = nameof(AdminEnums.SuperAdmin))]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            try
            {
                var result = await _service.DeleteAdminAsync(id);

                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Admin not found");
            }
        }
    }
}
