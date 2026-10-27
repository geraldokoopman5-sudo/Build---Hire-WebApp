using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Build_Hire.API.Media;

namespace Build_Hire.API.Controllers;

public class CompletedWorkForm
{
    [Required, StringLength(120)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(2000)] public string Description { get; set; } = string.Empty;
    [StringLength(120)] public string? Location { get; set; }
    [Required] public DateOnly? CompletedOn { get; set; }
    public Guid? JobId { get; set; }
    public IFormFile? Photo { get; set; }
}

[ApiController]
[Route("api/Companies")]
[Authorize]
public class CompletedWorkController(BuildAndHireDbContext db) : ControllerBase
{
    private Guid AccountId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);
    private bool Owns(Guid companyId) => User.IsInRole("Company") && AccountId == companyId;
    private Task<bool> CanRead(Guid companyId, CancellationToken cancellationToken)
    {
        var privileged = Owns(companyId) || User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
        return db.Companies.AnyAsync(c => c.CompanyId == companyId && (c.Status == AccountStatus.Active || privileged), cancellationToken);
    }

    [HttpGet("{companyId:guid}/business-information")]
    [AllowAnonymous]
    public async Task<IActionResult> BusinessInformation(Guid companyId, CancellationToken cancellationToken)
    {
        if (!await CanRead(companyId, cancellationToken)) return NotFound();
        var company = await db.Companies.AsNoTracking().Where(c => c.CompanyId == companyId)
            .Select(c => new { c.CompanyId, c.CompanyName, c.Status, c.address.City, c.address.Province, c.ProfilePhoto })
            .SingleAsync(cancellationToken);
        var posts = await db.CompletedWorkPosts.AsNoTracking().Where(p => p.CompanyId == companyId)
            .OrderByDescending(p => p.CompletedOn).ThenByDescending(p => p.CreatedAt)
            .Select(p => new { p.Id, p.Title, p.Description, p.Location, p.CompletedOn, p.JobId, p.CreatedAt, p.UpdatedAt })
            .ToListAsync(cancellationToken);
        return Ok(new { company.CompanyId, company.CompanyName, company.Status, company.City, company.Province,
            photoDataUrl = PhotoProcessor.DataUrl(company.ProfilePhoto),
            completedWork = posts.Select(p => new { p.Id, p.Title, p.Description, p.Location, p.CompletedOn, p.JobId,
                p.CreatedAt, photoUrl = $"/api/Companies/{companyId}/completed-work/{p.Id}/photo?v={p.UpdatedAt.Ticks}" }) });
    }

    [HttpGet("{companyId:guid}/completed-work/{postId:guid}/photo")]
    [AllowAnonymous]
    public async Task<IActionResult> Photo(Guid companyId, Guid postId, CancellationToken cancellationToken)
    {
        if (!await CanRead(companyId, cancellationToken)) return NotFound();
        var photo = await db.CompletedWorkPosts.AsNoTracking().Where(p => p.Id == postId && p.CompanyId == companyId)
            .Select(p => p.Photo).SingleOrDefaultAsync(cancellationToken);
        if (photo is null) return NotFound();
        Response.Headers.XContentTypeOptions = "nosniff";
        Response.Headers.CacheControl = "private, no-cache";
        return File(photo, "image/jpeg");
    }

    [HttpPost("me/completed-work")]
    [Authorize(Roles = "Company")]
    [RequestSizeLimit(PhotoProcessor.MaxRequestBytes)]
    public async Task<IActionResult> Create([FromForm] CompletedWorkForm form, CancellationToken cancellationToken)
    {
        var companyId = AccountId;
        if (await db.CompletedWorkPosts.CountAsync(p => p.CompanyId == companyId, cancellationToken) >= 50)
            return Conflict("You can publish up to 50 completed-work posts. Remove a post before adding another.");
        var error = await Validate(form, companyId, cancellationToken);
        if (error is not null) return BadRequest(error);
        var photo = await PhotoProcessor.ProcessAsync(form.Photo, 1600, cancellationToken);
        var post = new CompletedWorkPost { Id = Guid.NewGuid(), CompanyId = companyId, Photo = photo,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        Apply(post, form);
        db.CompletedWorkPosts.Add(post);
        await db.SaveChangesAsync(cancellationToken);
        return Created($"/api/Companies/{companyId}/business-information", new { post.Id });
    }

    [HttpPut("me/completed-work/{postId:guid}")]
    [Authorize(Roles = "Company")]
    [RequestSizeLimit(PhotoProcessor.MaxRequestBytes)]
    public async Task<IActionResult> Update(Guid postId, [FromForm] CompletedWorkForm form, CancellationToken cancellationToken)
    {
        var companyId = AccountId;
        var post = await db.CompletedWorkPosts.SingleOrDefaultAsync(p => p.Id == postId && p.CompanyId == companyId, cancellationToken);
        if (post is null) return NotFound();
        var error = await Validate(form, companyId, cancellationToken);
        if (error is not null) return BadRequest(error);
        if (form.Photo is not null) post.Photo = await PhotoProcessor.ProcessAsync(form.Photo, 1600, cancellationToken);
        Apply(post, form);
        post.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("me/completed-work/{postId:guid}")]
    [Authorize(Roles = "Company")]
    public async Task<IActionResult> Delete(Guid postId, CancellationToken cancellationToken)
    {
        var post = await db.CompletedWorkPosts.SingleOrDefaultAsync(p => p.Id == postId && p.CompanyId == AccountId, cancellationToken);
        if (post is null) return NotFound();
        db.CompletedWorkPosts.Remove(post);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<string?> Validate(CompletedWorkForm form, Guid companyId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(form.Title) || string.IsNullOrWhiteSpace(form.Description))
            return "A title and description are required.";
        var today = DateOnly.FromDateTime(BuildAndHire.Domain.Scheduling.JobCalendar.Today(DateTime.UtcNow));
        if (form.CompletedOn is null || form.CompletedOn > today || form.CompletedOn < new DateOnly(1900, 1, 1))
            return "Choose a completion date between 1900 and today.";
        if (form.JobId is not null && !await db.Jobs.AnyAsync(j => j.JobId == form.JobId && j.CompanyId == companyId
                && j.Status == JobEnum.Completed, cancellationToken))
            return "Only your own completed Build & Hire jobs can be linked to a post.";
        return null;
    }

    private static void Apply(CompletedWorkPost post, CompletedWorkForm form)
    {
        post.Title = form.Title.Trim();
        post.Description = form.Description.Trim();
        post.Location = form.Location?.Trim() ?? string.Empty;
        post.CompletedOn = form.CompletedOn!.Value;
        post.JobId = form.JobId;
    }
}
