using System.Security.Claims;
using Build_Hire.API.Media;
using System.ComponentModel.DataAnnotations;

namespace Build_Hire.API.Controllers;

public class ProfilePhotoForm
{
    [Required] public IFormFile? Photo { get; set; }
}

[ApiController]
[Route("api/Profile")]
[Authorize]
public class ProfileController(BuildAndHireDbContext db) : ControllerBase
{
    private Guid AccountId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var id = AccountId;
        if (User.IsInRole("Customer"))
        {
            var account = await db.Customers.AsNoTracking().Where(c => c.CustomerId == id)
                .Select(c => new { Name = c.CustomerName, c.Email, c.ProfilePhoto }).SingleOrDefaultAsync(cancellationToken);
            return account is null ? NotFound() : Ok(new { accountId = id, displayName = account.Name, account.Email,
                photoDataUrl = PhotoProcessor.DataUrl(account.ProfilePhoto) });
        }
        if (User.IsInRole("Company"))
        {
            var account = await db.Companies.AsNoTracking().Where(c => c.CompanyId == id)
                .Select(c => new { Name = c.CompanyName, Email = c.CompanyEmail, c.ProfilePhoto }).SingleOrDefaultAsync(cancellationToken);
            return account is null ? NotFound() : Ok(new { accountId = id, displayName = account.Name, account.Email,
                photoDataUrl = PhotoProcessor.DataUrl(account.ProfilePhoto) });
        }
        var admin = await db.Admin.AsNoTracking().Where(a => a.AdminId == id)
            .Select(a => new { Name = a.UserName, a.Email, a.ProfilePhoto }).SingleOrDefaultAsync(cancellationToken);
        return admin is null ? NotFound() : Ok(new { accountId = id, displayName = admin.Name, admin.Email,
            photoDataUrl = PhotoProcessor.DataUrl(admin.ProfilePhoto) });
    }

    [HttpPut("photo")]
    [RequestSizeLimit(PhotoProcessor.MaxRequestBytes)]
    public async Task<IActionResult> UploadPhoto([FromForm] ProfilePhotoForm form, CancellationToken cancellationToken)
    {
        var image = await PhotoProcessor.ProcessAsync(form.Photo, 512, cancellationToken);
        await SavePhoto(image, cancellationToken);
        return Ok(new { photoDataUrl = PhotoProcessor.DataUrl(image) });
    }

    [HttpDelete("photo")]
    public async Task<IActionResult> RemovePhoto(CancellationToken cancellationToken)
    {
        await SavePhoto(null, cancellationToken);
        return NoContent();
    }

    private async Task SavePhoto(byte[]? image, CancellationToken cancellationToken)
    {
        var id = AccountId;
        if (User.IsInRole("Customer"))
        {
            var account = await db.Customers.SingleAsync(c => c.CustomerId == id, cancellationToken);
            account.ProfilePhoto = image;
        }
        else if (User.IsInRole("Company"))
        {
            var account = await db.Companies.SingleAsync(c => c.CompanyId == id, cancellationToken);
            account.ProfilePhoto = image;
        }
        else
        {
            var account = await db.Admin.SingleAsync(c => c.AdminId == id, cancellationToken);
            account.ProfilePhoto = image;
        }
        await db.SaveChangesAsync(cancellationToken);
    }
}
