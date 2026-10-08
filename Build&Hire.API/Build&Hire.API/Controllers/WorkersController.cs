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
        await using var transaction = await db.Database.BeginTransactionAsync();
        if (CompanyId is not Guid companyId) return Unauthorized();
        if (!await db.Companies.AnyAsync(c => c.CompanyId == companyId && c.Status == AccountStatus.Active))
            return Forbid();
        if (dto.JobId is Guid jobId)
        {
            var job = await db.Jobs.FromSqlInterpolated($"SELECT * FROM \"Jobs\" WHERE \"JobId\" = {jobId} FOR UPDATE")
                .AsNoTracking().SingleOrDefaultAsync(j => j.CompanyId == companyId);
            if (job == null)
                return BadRequest(new ProblemDetails { Title = "Select a job belonging to your company.", Status = 400 });
            if (job.AcceptedAt == null)
                return Conflict("Accept the job before assigning workers to it.");
            if (job.Status is not (JobEnum.Accepted or JobEnum.InProgress))
                return Conflict("Workers cannot be assigned to a closed job.");
        }

        dto.CompanyId = companyId;
        var worker = await service.AddWorkerAsync(dto);
        await transaction.CommitAsync();
        return CreatedAtAction(nameof(GetWorkersById), new { id = worker.WorkerId }, worker);
    }

    [HttpPatch("{id:guid}/job")]
    public async Task<IActionResult> AssignWorker(Guid id, WorkerJobAssignmentRequest request)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        if (CompanyId is not Guid companyId) return Unauthorized();
        var worker = await db.Workers.SingleOrDefaultAsync(w => w.WorkerId == id && w.CompanyId == companyId);
        if (worker == null) return NotFound();
        if (request.JobId == Guid.Empty) return BadRequest("Use a valid job ID, or null to unassign the worker.");
        if (request.JobId is Guid jobId)
        {
            var job = await db.Jobs.FromSqlInterpolated($"SELECT * FROM \"Jobs\" WHERE \"JobId\" = {jobId} FOR UPDATE")
                .AsNoTracking().SingleOrDefaultAsync(j => j.CompanyId == companyId);
            if (job == null) return BadRequest("Select a job belonging to your company.");
            if (job.AcceptedAt == null) return Conflict("Accept the job before assigning workers to it.");
            if (job.Status is not (JobEnum.Accepted or JobEnum.InProgress))
                return Conflict("Workers cannot be assigned to a closed job.");
        }
        worker.JobId = request.JobId;
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Ok(await service.GetWorkersByIdAsync(id));
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

public sealed class WorkerJobAssignmentRequest
{
    [System.Text.Json.Serialization.JsonRequired]
    public Guid? JobId { get; set; }
}
