using System.Security.Claims;

namespace Build_Hire.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class JobsController(IJobService service, BuildAndHireDbContext db) : ControllerBase
{
    private Guid? AccountId => Guid.TryParse(
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out var id) ? id : null;
    private bool IsAdmin => User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
    private bool CanAccess(JobDto job) => IsAdmin ||
        (User.IsInRole("Customer") && job.CustomerId == AccountId) ||
        (User.IsInRole("Company") && job.CompanyId == AccountId);

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<JobDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllJobs()
    {
        if (AccountId == null) return Unauthorized();
        var jobs = await service.GetAllJobsAsync();
        return Ok(jobs.Where(CanAccess));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetJobsById(Guid id)
    {
        var job = await service.GetJobByIdAsync(id);
        return job == null || !CanAccess(job) ? NotFound() : Ok(job);
    }

    [HttpPost]
    [ProducesResponseType(typeof(JobDto), StatusCodes.Status201Created)]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> RegisterJob(RegisterJobDto dto)
    {
        if (AccountId is not Guid customerId) return Unauthorized();
        if (!await db.Customers.AnyAsync(c => c.CustomerId == customerId && c.Status == AccountStatus.Active))
            return Forbid();
        if (!await db.Companies.AnyAsync(c => c.CompanyId == dto.CompanyId && c.Status == AccountStatus.Active))
            return BadRequest(new ProblemDetails { Title = "Select an existing, active company.", Status = 400 });
        dto.CustomerId = customerId;
        var job = await service.RegisterJobAsync(dto);
        job.CompanyName = await db.Companies.Where(c => c.CompanyId == dto.CompanyId).Select(c => c.CompanyName).SingleAsync();
        return CreatedAtAction(nameof(GetJobsById), new { id = job.JobId }, job);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Company,Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateJobDetails(Guid id, UpdateJobDetailsDto dto)
    {
        var existing = await service.GetJobByIdAsync(id);
        if (existing == null || !CanAccess(existing)) return NotFound();
        return Ok(await service.UpdateJobDetailsAsync(id, dto));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Customer,Admin,SuperAdmin")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        var existing = await service.GetJobByIdAsync(id);
        if (existing == null || !CanAccess(existing)) return NotFound();
        return Ok(await service.DeleteJobAsync(id));
    }
}
