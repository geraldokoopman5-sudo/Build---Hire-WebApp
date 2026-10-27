using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Build_Hire.API.Media;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Domain.Models;
using BuildAndHire.Domain.ValueObjects;
using BuildAndHire.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql;
using SkiaSharp;

internal static class MediaChecks
{
    private static byte[] ImageBytes(SKEncodedImageFormat format = SKEncodedImageFormat.Png)
    {
        using var bitmap = new SKBitmap(80, 40);
        using (var canvas = new SKCanvas(bitmap)) { canvas.Clear(SKColors.SandyBrown); }
        using var image = SKImage.FromBitmap(bitmap);
        using var data = image.Encode(format, 90);
        return data.ToArray();
    }
    private static FormFile File(byte[] bytes) => new(new MemoryStream(bytes), 0, bytes.Length, "photo", "photo.png");

    public static async Task StandaloneAsync(Action<bool, string> check)
    {
        foreach (var format in new[] { SKEncodedImageFormat.Png, SKEncodedImageFormat.Jpeg, SKEncodedImageFormat.Webp })
        {
            var photo = await PhotoProcessor.ProcessAsync(File(ImageBytes(format)), 32, default);
            using var codec = SKCodec.Create(new MemoryStream(photo));
            check(codec is { EncodedFormat: SKEncodedImageFormat.Jpeg } && codec.Info.Width == 32 && codec.Info.Height == 16,
                $"{format} uploads are decoded, resized and re-encoded as JPEG");
        }
        foreach (var invalid in new[] { Array.Empty<byte>(), Encoding.UTF8.GetBytes("<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
            Encoding.UTF8.GetBytes("<html>not a photo</html>"), ImageBytes()[..30], new byte[PhotoProcessor.MaxUploadBytes + 1] })
        {
            try { await PhotoProcessor.ProcessAsync(File(invalid), 32, default); throw new Exception("Invalid upload accepted."); }
            catch (ValidationException) { check(true, "Empty, invalid, vector, truncated or oversized image rejected"); }
        }
        // An EXIF orientation 6 header requires a clockwise rotation. Output has no EXIF header.
        var jpeg = ImageBytes(SKEncodedImageFormat.Jpeg);
        byte[] exif = [0xff, 0xe1, 0, 34, 69, 120, 105, 102, 0, 0, 73, 73, 42, 0, 8, 0, 0, 0,
            1, 0, 18, 1, 3, 0, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0];
        var rotated = jpeg[..2].Concat(exif).Concat(jpeg[2..]).ToArray();
        var oriented = await PhotoProcessor.ProcessAsync(File(rotated), 512, default);
        using var result = SKCodec.Create(new MemoryStream(oriented));
        check(result.Info.Width == 40 && result.Info.Height == 80 && result.EncodedOrigin == SKEncodedOrigin.TopLeft
            && !Encoding.ASCII.GetString(oriented).Contains("Exif"), "Camera orientation is applied and source metadata is stripped");
    }

    public static async Task HttpAsync(HttpClient client, string connectionString, string password, string superAdmin, string admin,
        Action<bool, string> check)
    {
        async Task<JsonElement> Send(string method, string path, int expected, string? token = null, HttpContent? body = null)
        {
            using var request = new HttpRequestMessage(new HttpMethod(method), path) { Content = body };
            if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            using var response = await client.SendAsync(request);
            check((int)response.StatusCode == expected, $"Media {method} {path}: expected {expected}, received {(int)response.StatusCode}");
            return response.Content.Headers.ContentType?.MediaType?.Contains("json") == true
                ? (await response.Content.ReadFromJsonAsync<JsonElement>()).Clone() : default;
        }
        async Task<string> Login(string email) => (await Send("POST", "/api/Auth/login", 200, body: JsonContent.Create(new { email, password })))
            .GetProperty("accessToken").GetString()!;
        MultipartFormDataContent Upload(byte[]? photo, Guid? jobId = null, string? completedOn = null, string title = "Media finished kitchen")
        {
            var form = new MultipartFormDataContent();
            form.Add(new StringContent(title), "title");
            form.Add(new StringContent("A finished renovation shared by its company."), "description");
            form.Add(new StringContent(completedOn ?? DateTime.UtcNow.Date.ToString("yyyy-MM-dd")), "completedOn");
            if (jobId is not null) form.Add(new StringContent(jobId.Value.ToString()), "jobId");
            if (photo is not null) form.Add(new ByteArrayContent(photo), "photo", "photo.png");
            return form;
        }
        var address = new { streetAddress = "22 Media Road", suburb = "Central", city = "Cape Town", province = "Western Cape", postalCode = 8001 };
        var customer = await Send("POST", "/api/Customer", 201, body: JsonContent.Create(new { customerName = "Media Customer", email = "media-customer@example.test", password, address }));
        await Send("POST", "/api/Customer", 201, body: JsonContent.Create(new { customerName = "Other Media Customer", email = "media-other@example.test", password, address }));
        var customerToken = await Login("media-customer@example.test");
        var otherCustomer = await Login("media-other@example.test");
        async Task<Guid> Company(string email) => (await Send("POST", "/api/Companies", 201, body: JsonContent.Create(new {
            companyName = "Media Builders", companyEmail = email, password, registrationNumber = "1234567890", taxNumber = "0123456789", address })))
            .GetProperty("companyId").GetGuid();
        var companyId = await Company("media-company@example.test");
        var otherCompanyId = await Company("media-other-company@example.test");
        await Send("GET", $"/api/Companies/{companyId}/business-information", 404);
        foreach (var id in new[] { companyId, otherCompanyId })
            await Send("PATCH", $"/api/Companies/{id}/Status", 204, superAdmin, JsonContent.Create(new { status = 0 }));
        var companyToken = await Login("media-company@example.test");
        var otherCompany = await Login("media-other-company@example.test");
        var png = ImageBytes();
        await Send("GET", "/api/Profile", 401);
        await Send("PUT", "/api/Profile/photo", 401, body: Upload(png));
        foreach (var token in new[] { customerToken, companyToken, admin, superAdmin })
        {
            var original = await Send("GET", "/api/Profile", 200, token);
            check(original.GetProperty("photoDataUrl").ValueKind == JsonValueKind.Null, "New accounts have no profile photo");
            await Send("PUT", "/api/Profile/photo", 200, token, Upload(png));
            var saved = await Send("GET", "/api/Profile", 200, token);
            check(saved.GetProperty("photoDataUrl").GetString()!.StartsWith("data:image/jpeg;base64,")
                && saved.GetProperty("accountId").GetGuid() == original.GetProperty("accountId").GetGuid(),
                "Customer, company, admin and SuperAdmin photos persist for the authenticated account");
            await Send("PUT", "/api/Profile/photo", 400, token, Upload(Encoding.UTF8.GetBytes("<svg></svg>")));
            if (token != companyToken)
            {
                await Send("DELETE", "/api/Profile/photo", 204, token);
                check((await Send("GET", "/api/Profile", 200, token)).GetProperty("photoDataUrl").ValueKind == JsonValueKind.Null,
                    "Removing a profile photo persists");
            }
        }
        check((await Send("GET", "/api/Profile", 200, otherCustomer)).GetProperty("photoDataUrl").ValueKind == JsonValueKind.Null,
            "Profile uploads never alter another account");
        await Send("PUT", "/api/Profile/photo", 400, companyToken, Upload(new byte[PhotoProcessor.MaxUploadBytes + 1]));
        foreach (var token in new string?[] { null, customerToken, admin, superAdmin })
            await Send("POST", "/api/Companies/me/completed-work", token is null ? 401 : 403, token, Upload(png));
        await Send("POST", "/api/Companies/me/completed-work", 400, companyToken, Upload(null));
        await Send("POST", "/api/Companies/me/completed-work", 400, companyToken, Upload(png, completedOn: "2099-01-01"));
        await Send("POST", "/api/Companies/me/completed-work", 400, companyToken, Upload(png, title: new string('x', 121)));
        var past = await Send("POST", "/api/Companies/me/completed-work", 201, companyToken, Upload(png));
        var postId = past.GetProperty("id").GetGuid();
        await Send("PUT", $"/api/Companies/me/completed-work/{postId}", 404, otherCompany, Upload(png));
        await Send("DELETE", $"/api/Companies/me/completed-work/{postId}", 404, otherCompany);
        var options = new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql(connectionString).Options;
        var completed = Guid.NewGuid(); var unfinished = Guid.NewGuid(); var unrelated = Guid.NewGuid();
        await using (var db = new BuildAndHireDbContext(options))
        {
            foreach (var (id, owner, status) in new[] { (completed, companyId, JobEnum.Completed), (unfinished, companyId, JobEnum.Requested), (unrelated, otherCompanyId, JobEnum.Completed) })
                db.Jobs.Add(new Jobs { JobId = id, CompanyId = owner, CustomerId = customer.GetProperty("customerId").GetGuid(),
                    JobDescription = "Media completed-work link fixture", Status = status, StartDate = DateTime.UtcNow.Date,
                    EndDate = DateTime.UtcNow.Date, address = new Address { StreetAddress = "23 Media Road", Suburb = "Central", City = "Cape Town", Province = "Western Cape", PostalCode = 8001 } });
            await db.SaveChangesAsync();
        }
        await Send("POST", "/api/Companies/me/completed-work", 400, companyToken, Upload(png, unfinished));
        await Send("POST", "/api/Companies/me/completed-work", 400, companyToken, Upload(png, unrelated));
        await Send("POST", "/api/Companies/me/completed-work", 201, companyToken, Upload(png, completed, title: "Completed platform project"));
        var business = await Send("GET", $"/api/Companies/{companyId}/business-information", 200);
        check(business.GetProperty("completedWork").GetArrayLength() == 2 && !business.TryGetProperty("companyEmail", out _)
            && !business.TryGetProperty("taxNumber", out _) && business.GetProperty("photoDataUrl").ValueKind == JsonValueKind.String,
            "Business information exposes published posts and company photo without private account details");
        var imagePath = business.GetProperty("completedWork").EnumerateArray().Single(p => p.GetProperty("id").GetGuid() == postId).GetProperty("photoUrl").GetString()!;
        using (var photo = await client.GetAsync(imagePath))
            check(photo.IsSuccessStatusCode && photo.Content.Headers.ContentType?.MediaType == "image/jpeg"
                && photo.Headers.GetValues("X-Content-Type-Options").Single() == "nosniff", "Portfolio images are served as normalized JPEG with nosniff");
        await Send("PUT", $"/api/Companies/me/completed-work/{postId}", 204, companyToken, Upload(null, title: "Edited finished kitchen"));
        await using (var db = new BuildAndHireDbContext(options))
        {
            var saved = await db.CompletedWorkPosts.AsNoTracking().SingleAsync(p => p.Id == postId);
            check(saved.Title == "Edited finished kitchen" && saved.Photo.Length > 0 && saved.Location == "", "Post editing preserves its photo when no replacement is selected");
            try { await db.GetService<IMigrator>().MigrateAsync("20261008075836_JobAndQuoteLifecycle"); throw new Exception("Rollback discarded uploaded media."); }
            catch (PostgresException exception) when (exception.SqlState == "P0001") { check(true, "Migration rollback refuses to discard profile photos or completed-work posts"); }
        }
        await Send("DELETE", $"/api/Companies/me/completed-work/{postId}", 204, companyToken);
        await Send("GET", imagePath, 404);
        await Send("PATCH", $"/api/Companies/{companyId}/Status", 204, superAdmin, JsonContent.Create(new { status = 1 }));
        await Send("GET", $"/api/Companies/{companyId}/business-information", 404);
        var remainingImage = business.GetProperty("completedWork").EnumerateArray().Single(p => p.GetProperty("jobId").ValueKind != JsonValueKind.Null).GetProperty("photoUrl").GetString()!;
        await Send("GET", remainingImage, 404);
        await Send("POST", "/api/Companies/me/completed-work", 401, companyToken, Upload(png));
    }
}
