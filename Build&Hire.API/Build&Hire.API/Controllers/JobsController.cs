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

    [HttpPost("{id:guid}/accept")]
    [Authorize(Roles = "Company")]
    public async Task<IActionResult> AcceptJob(Guid id)
    {
        return await Transition(id, JobEnum.Requested, JobEnum.Accepted);
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = "Company")]
    public Task<IActionResult> RejectJob(Guid id) => Transition(id, JobEnum.Requested, JobEnum.Rejected);

    [HttpPost("{id:guid}/start")]
    [Authorize(Roles = "Company")]
    public Task<IActionResult> StartJob(Guid id) => Transition(id, JobEnum.Accepted, JobEnum.InProgress);

    [HttpPost("{id:guid}/complete")]
    [Authorize(Roles = "Company")]
    public Task<IActionResult> CompleteJob(Guid id) => Transition(id, JobEnum.InProgress, JobEnum.Completed);

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Customer,Admin,SuperAdmin")]
    public Task<IActionResult> CancelJob(Guid id) => Transition(id, null, JobEnum.Cancelled);

    [HttpPost("{id:guid}/quote")]
    [Authorize(Roles = "Company")]
    public async Task<IActionResult> SendQuote(Guid id, JobQuoteRequest request)
    {
        if (request.Quote <= 0 || request.Quote > 99999999.99m || decimal.Round(request.Quote, 2) != request.Quote)
            return BadRequest("Enter a positive quote with at most two decimal places, up to 99999999.99.");
        await using var transaction = await db.Database.BeginTransactionAsync();
        var job = await LockJob(id);
        if (job == null || !Owns(job)) return NotFound();
        if (job.Status != JobEnum.Accepted) return Conflict("Accept the job before sending a quote.");
        if (job.QuoteAcceptedAt != null || await db.Payment.AnyAsync(p => p.JobId == id))
            return Conflict("The quote is locked after customer acceptance or payment creation.");
        job.Quote = request.Quote;
        job.QuoteSentAt = UtcTimestamp();
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Ok(await service.GetJobByIdAsync(id));
    }

    [HttpPost("{id:guid}/quote/accept")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> AcceptQuote(Guid id, JobQuoteRequest request)
    {
        if (request.Quote <= 0) return BadRequest("Confirm the quoted amount greater than zero.");
        await using var transaction = await db.Database.BeginTransactionAsync();
        var job = await LockJob(id);
        if (job == null || !Owns(job)) return NotFound();
        if (job.Status != JobEnum.Accepted || job.QuoteSentAt == null)
            return Conflict("The company must accept the job and send a quote first.");
        if (request.Quote != job.Quote) return Conflict("The quote changed. Review the current amount before accepting.");
        job.QuoteAcceptedAt ??= UtcTimestamp();
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Ok(await service.GetJobByIdAsync(id));
    }

    // Every lifecycle/quote mutation locks the same row to serialize competing actions.
    private async Task<BuildAndHire.Domain.Models.Jobs?> LockJob(Guid id)
    {
        var job = await db.Jobs.FromSqlInterpolated($"SELECT * FROM \"Jobs\" WHERE \"JobId\" = {id} FOR UPDATE")
            .SingleOrDefaultAsync();
        if (job != null) await db.Entry(job).ReloadAsync();
        return job;
    }

    private bool Owns(BuildAndHire.Domain.Models.Jobs job) => IsAdmin ||
        (User.IsInRole("Customer") && job.CustomerId == AccountId) ||
        (User.IsInRole("Company") && job.CompanyId == AccountId);

    // PostgreSQL timestamps retain microseconds; responses use that same precision.
    private static DateTime UtcTimestamp() => new(DateTime.UtcNow.Ticks / 10 * 10, DateTimeKind.Utc);

    private async Task<IActionResult> Transition(Guid id, JobEnum? from, JobEnum to)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        var job = await LockJob(id);
        if (job == null || !Owns(job)) return NotFound();
        if (job.Status == to) return Ok(await service.GetJobByIdAsync(id));
        if (to == JobEnum.Cancelled)
        {
            if (job.Status is not (JobEnum.Requested or JobEnum.Accepted))
                return Conflict("Only requested or accepted jobs can be cancelled.");
            if (await db.Payment.AnyAsync(p => p.JobId == id))
                return Conflict("Resolve the payment record before cancelling this job.");
        }
        else if (job.Status != from) return Conflict("This transition is not allowed from the current job status.");
        if (to == JobEnum.InProgress && job.QuoteAcceptedAt == null)
            return Conflict("The customer must accept the quote before work starts.");
        job.Status = to;
        if (to == JobEnum.Accepted) job.AcceptedAt ??= UtcTimestamp();
        if (to is JobEnum.Completed or JobEnum.Cancelled)
            await db.Workers.Where(w => w.JobId == id).ExecuteUpdateAsync(update => update.SetProperty(w => w.JobId, (Guid?)null));
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Ok(await service.GetJobByIdAsync(id));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Company,Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateJobDetails(Guid id, UpdateJobDetailsDto dto)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        var existing = await LockJob(id);
        if (existing == null || !Owns(existing)) return NotFound();
        if (existing.Status != JobEnum.Accepted) return Conflict("Only accepted jobs can be edited.");
        if (dto.Status.HasValue && dto.Status != existing.Status)
            return Conflict("Use the lifecycle endpoints to change job status.");
        if (dto.PayingMethod != existing.PayingMethod && await db.Payment.AnyAsync(p => p.JobId == id))
            return Conflict("The payment method cannot change after a payment record exists.");
        if (dto.Quote != existing.Quote)
        {
            if (!User.IsInRole("Company")) return Forbid();
            if (existing.QuoteAcceptedAt != null || await db.Payment.AnyAsync(p => p.JobId == id))
                return Conflict("The quote is locked after customer acceptance or payment creation.");
            existing.QuoteSentAt = dto.Quote > 0 ? UtcTimestamp() : null;
        }
        var updated = await service.UpdateJobDetailsAsync(id, dto);
        await transaction.CommitAsync();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Customer,Admin,SuperAdmin")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        return await CancelJob(id);
    }
}

public sealed class JobQuoteRequest
{
    [System.Text.Json.Serialization.JsonRequired]
    public decimal Quote { get; set; }
}
