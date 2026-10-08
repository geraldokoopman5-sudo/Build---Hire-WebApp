using System.Security.Claims;

namespace Build_Hire.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CompaniesController(ICompanyService service, BuildAndHireDbContext db) : ControllerBase
{
    private bool IsAdmin => User.IsInRole("Admin") || User.IsInRole("SuperAdmin");

    private bool CanAccess(Guid id) => IsAdmin ||
        (User.IsInRole("Company") &&
         Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out var accountId) &&
         accountId == id);

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllCompanies()
    {
        var companies = await service.GetAllCompaniesAsync();
        if (IsAdmin) return Ok(companies);

        return Ok(companies
            .Where(c => c.Status == AccountStatus.Active)
            .Select(c => new { c.CompanyId, c.CompanyName, c.Status }));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCompnaiesById(Guid id)
    {
        if (!CanAccess(id)) return NotFound();
        var company = await service.GetCompanyByIdAsync(id);
        return company == null ? NotFound() : Ok(company);
    }

    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> RegisterComapny(RegisterCompanyDto dto)
    {
        var company = await service.RegisterCompanyAsync(dto);
        return CreatedAtAction(nameof(GetCompnaiesById), new { id = company.CompanyId }, company);
    }

    [HttpPatch("{id:guid}/Status")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateCompanyStatus(Guid id, UpdateCompanyStatusDto dto)
    {
        var company = await db.Companies.FindAsync(id);
        if (company == null) return NotFound();
        company.Status = dto.Status;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCompanyDetails(Guid id, UpdateCompanyDto dto)
    {
        if (!CanAccess(id)) return NotFound();
        var updated = await service.UpdateCompanyAsync(id, dto);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletCompany(Guid id)
    {
        if (!CanAccess(id)) return NotFound();
        if (!await db.Companies.AnyAsync(c => c.CompanyId == id)) return NotFound();
        if (await db.Jobs.AnyAsync(j => j.CompanyId == id) ||
            await db.Workers.AnyAsync(w => w.CompanyId == id))
            return Conflict("This company has jobs or workers. Resolve them before deleting the account.");

        return Ok(await service.DeleteCompanyAsync(id));
    }
}
