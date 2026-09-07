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
        public async Task<IActionResult> RegisterComapny(RegisterCompanyDto dto)
        {
            var company = await _cmpService.RegisterCompanyAsync(dto);
            return CreatedAtAction(nameof(GetCompnaiesById),
                new { id = company.CompanyId },
                company);
        }
        [HttpPatch("{id}/Status")]
        [Authorize(Roles = nameof(AccountType.Admin))]
        public async Task<IActionResult> UpdateCompanyStatus(UpdateCompanyDto dto, Guid id)  //Save for when incorparating JWT tokens
        {
            await _cmpService.UpdateCompanyAsync(id, dto);

            return NoContent();

        }
        [HttpPut("{id}")]
        public async Task<IActionResult>UpdateCompanyDetails(Guid id, UpdateCompanyDto dto)
        {
            var update = await _cmpService.UpdateCompanyAsync(id, dto);
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
