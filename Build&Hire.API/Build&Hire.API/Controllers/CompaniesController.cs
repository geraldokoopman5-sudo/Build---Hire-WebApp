namespace Build_Hire.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniesController : ControllerBase
    {
        private readonly ICompanyService _cmpService;

        public CompaniesController(ICompanyService cmpService)
        {
            _cmpService = cmpService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CompanyDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCompanies()
        {
            var companies = await _cmpService.GetAllCompaniesAsync();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompnaiesById(Guid id)
        {
            var companies = await _cmpService.GetCompanyByIdAsync(id);
            if (companies == null) return NotFound("Invalid id for Companies");

            return Ok(companies);
        }

        [HttpPost]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status201Created)]
        public async Task<IActionResult> RegisterComapny(RegisterCompanyDto dto)
        {
            var company = await _cmpService.RegisterCompanyAsync(dto);
            return CreatedAtAction(nameof(GetCompnaiesById),
                new { id = company.CompanyId },
                company);
        }
        [HttpPatch("{id}/Status")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> UpdateCompanyStatus(UpdateCompanyStatusDto dto, Guid id, [FromServices] BuildAndHireDbContext db)  //Save for when incorparating JWT tokens
        {
            var company = await db.Companies.FindAsync(id);
            if (company == null) return NotFound();
            company.Status = dto.Status;
            await db.SaveChangesAsync();

            return NoContent();

        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Company,Admin,SuperAdmin")]
        public async Task<IActionResult>UpdateCompanyDetails(Guid id, UpdateCompanyDto dto)
        {
            var subject = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;
            if (!User.IsInRole("Admin") && !User.IsInRole("SuperAdmin") && subject != id.ToString())
                return Forbid();
            var update = await _cmpService.UpdateCompanyAsync(id, dto);
            if (update == null) return NotFound();
            return Ok(update);
        }

        [HttpDelete("{id}")]
        [Authorize (Roles = $"{nameof(AccountType.Admin)},{nameof(AccountType.Company)}")]
        
        public async Task<IActionResult>DeletCompany(Guid id)
        {
            var delete = await _cmpService.DeleteCompanyAsync(id);

            return Ok(delete);
        }
    }
}
