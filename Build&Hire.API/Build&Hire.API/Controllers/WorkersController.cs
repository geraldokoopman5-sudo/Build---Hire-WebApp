using System.Security.Claims;

namespace Build_Hire.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Company")]
public class WorkersController(IWorkerService service, BuildAndHireDbContext db) : ControllerBase
{
    private Guid? CompanyId => Guid.TryParse(
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out var id) ? id : null;

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<WorkerDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllWorkers()
    {
        if (CompanyId is not Guid companyId) return Unauthorized();
        var workers = await service.GetAllWorkersAsync();
        return Ok(workers.Where(w => w.CompanyId == companyId));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetWorkersById(Guid id)
    {
        if (CompanyId is not Guid companyId) return Unauthorized();
        if (!await db.Workers.AnyAsync(w => w.WorkerId == id && w.CompanyId == companyId))
            return NotFound();

        return Ok(await service.GetWorkersByIdAsync(id));
    }

    [HttpPost]
    [ProducesResponseType(typeof(AddWorkerDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddWorker(AddWorkerDto dto)
    {
        if (CompanyId is not Guid companyId) return Unauthorized();
        if (!await db.Companies.AnyAsync(c => c.CompanyId == companyId && c.Status == AccountStatus.Active))
            return Forbid();
        if (!await db.Jobs.AnyAsync(j => j.JobId == dto.JobId && j.CompanyId == companyId))
            return BadRequest(new ProblemDetails { Title = "Select a job belonging to your company.", Status = 400 });

        dto.CompanyId = companyId;
        var worker = await service.AddWorkerAsync(dto);
        return CreatedAtAction(nameof(GetWorkersById), new { id = worker.WorkerId }, worker);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> EditWorkerDetails(Guid id, UpdateWorkerDto dto)
    {
        if (CompanyId is not Guid companyId) return Unauthorized();
        if (!await db.Workers.AnyAsync(w => w.WorkerId == id && w.CompanyId == companyId))
            return NotFound();

        return Ok(await service.UpdateWorkerAsync(id, dto));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWorkerDetails(Guid id)
    {
        if (CompanyId is not Guid companyId) return Unauthorized();
        if (!await db.Workers.AnyAsync(w => w.WorkerId == id && w.CompanyId == companyId))
            return NotFound();

        return Ok(await service.DeleteWorkerAsync(id));
    }
}
