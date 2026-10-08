using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Build_Hire.API.Controllers;
using BuildAndHire.Domain.Enums;
using BuildAndHire.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Microsoft.IdentityModel.Tokens;

/// <summary>Runs the real API against a caller-owned disposable PostgreSQL schema.</summary>
internal static class HttpWorkflowChecks
{
    public static async Task RunAsync(string connectionString, string password)
    {
        var schema = new NpgsqlConnectionStringBuilder(connectionString).SearchPath;
        if (schema is null || !System.Text.RegularExpressions.Regex.IsMatch(schema, "^integration_[a-f0-9]{32}$"))
            throw new InvalidOperationException("HTTP checks require an isolated integration schema.");

        // Reserve an ephemeral loopback port. The child process is always stopped before schema cleanup.
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        var start = new ProcessStartInfo("dotnet")
        {
            UseShellExecute = false, CreateNoWindow = true,
            RedirectStandardOutput = true, RedirectStandardError = true,
            WorkingDirectory = AppContext.BaseDirectory
        };
        start.ArgumentList.Add(typeof(AuthController).Assembly.Location);
        start.ArgumentList.Add("--urls");
        start.ArgumentList.Add($"http://127.0.0.1:{port}");
        start.Environment["ASPNETCORE_ENVIRONMENT"] = "Development";
        start.Environment["DOTNET_ENVIRONMENT"] = "Development";
        start.Environment["ConnectionStrings__DefaultConnection"] = connectionString;
        start.Environment["BootstrapAdmin__Enabled"] = "false";
        start.Environment["JwtConfig__Issuer"] = "http-integration";
        start.Environment["JwtConfig__Audience"] = "http-integration";
        start.Environment["JwtConfig__Key"] = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        start.Environment["JwtConfig__TokenValidityMins"] = "10";
        start.Environment["Logging__LogLevel__Default"] = "Critical";
        start.Environment["Logging__LogLevel__Microsoft"] = "Critical";
        using var process = Process.Start(start) ?? throw new InvalidOperationException("Cannot start isolated API.");
        // Drain logs without printing connection strings, credentials, tokens or response bodies.
        var stdout = process.StandardOutput.ReadToEndAsync();
        var stderr = process.StandardError.ReadToEndAsync();
        using var client = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false })
        { BaseAddress = new Uri($"http://127.0.0.1:{port}"), Timeout = TimeSpan.FromSeconds(10) };
        var checks = 0;
        void Check(bool condition, string name)
        {
            if (!condition) throw new Exception("FAILED HTTP: " + name);
            checks++;
            Console.WriteLine("PASS HTTP: " + name);
        }
        async Task<JsonElement> Send(string method, string path, int expected, object? body = null, string? token = null)
        {
            using var request = new HttpRequestMessage(new HttpMethod(method), path);
            if (body != null) request.Content = JsonContent.Create(body);
            if (token != null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            using var response = await client.SendAsync(request);
            Check((int)response.StatusCode == expected, $"{method} {path}: expected {expected}, received {(int)response.StatusCode}");
            if (response.Content.Headers.ContentType?.MediaType?.Contains("json") == true)
                return (await response.Content.ReadFromJsonAsync<JsonElement>()).Clone();
            return default;
        }
        async Task<string> Login(string email) => (await Send("POST", "/api/Auth/login", 200,
            new { email, password })).GetProperty("accessToken").GetString()!;
        var address = new { streetAddress = "20 Test Road", suburb = "Central", city = "Cape Town", province = "Western Cape", postalCode = 8001 };
        var date = DateTime.UtcNow.Date.AddDays(1);
        try
        {
            var ready = false;
            for (var attempt = 0; attempt < 100 && !process.HasExited; attempt++)
            {
                try
                {
                    using var probe = await client.GetAsync("/swagger/v1/swagger.json");
                    if (probe.IsSuccessStatusCode) { ready = true; break; }
                }
                catch (HttpRequestException) { }
                await Task.Delay(100);
            }
            Check(ready, "Isolated API starts with real middleware");
            await Send("GET", "/api/Jobs", 401);
            await Send("GET", "/api/Jobs", 401, token: "invalid-token");
            using (var preflight = new HttpRequestMessage(HttpMethod.Options, "/api/Customer"))
            {
                preflight.Headers.Add("Origin", "http://localhost:5173");
                preflight.Headers.Add("Access-Control-Request-Method", "POST");
                preflight.Headers.Add("Access-Control-Request-Headers", "content-type,authorization");
                using var response = await client.SendAsync(preflight);
                Check(response.StatusCode == HttpStatusCode.NoContent &&
                    response.Headers.TryGetValues("Access-Control-Allow-Origin", out var origins) && origins.Single() == "http://localhost:5173",
                    "Configured frontend CORS preflight succeeds");
            }
            using (var preflight = new HttpRequestMessage(HttpMethod.Options, "/api/Customer"))
            {
                preflight.Headers.Add("Origin", "https://untrusted.example");
                preflight.Headers.Add("Access-Control-Request-Method", "POST");
                using var response = await client.SendAsync(preflight);
                Check(!response.Headers.Contains("Access-Control-Allow-Origin"), "Unconfigured origin receives no CORS permission");
            }
            var validation = await Send("POST", "/api/Customer", 400, new { });
            Check(validation.GetProperty("errors").TryGetProperty("Password", out _), "HTTP validation filter rejects missing signup password");
            var superAdmin = await Login("superadmin@example.test");
            await Send("POST", "/api/Admin", 201, new
            { userName = "HttpAdmin", email = "http-admin@example.test", password, status = 0, adminRole = 1 }, superAdmin);
            var admin = await Login("http-admin@example.test");
            await Send("GET", "/api/Admin", 403, token: admin);

            object CompanySignup(string email) => new
            { companyName = "HTTP Company", companyEmail = email, password, registrationNumber = "1234567890", taxNumber = "0123456789", address };
            var companyBody = CompanySignup("http-company@example.test");
            var company = await Send("POST", "/api/Companies", 201, companyBody);
            var companyId = company.GetProperty("companyId").GetGuid();
            Check(company.GetProperty("status").GetInt32() == 3 && !company.TryGetProperty("passwordHash", out _), "Company signup is pending and exposes no password hash");
            await Send("POST", "/api/Companies", 409, companyBody);
            await Send("POST", "/api/Auth/login", 401, new { email = "http-company@example.test", password });
            var otherCompany = await Send("POST", "/api/Companies", 201, CompanySignup("http-other-company@example.test"));
            var otherCompanyId = otherCompany.GetProperty("companyId").GetGuid();
            await Send("PATCH", $"/api/Companies/{companyId}/Status", 204, new { status = 0 }, admin);
            await Send("PATCH", $"/api/Companies/{otherCompanyId}/Status", 204, new { status = 0 }, admin);
            var companyToken = await Login("http-company@example.test");
            var otherCompanyToken = await Login("http-other-company@example.test");
            await Send("PATCH", $"/api/Companies/{companyId}/Status", 403, new { status = 0 }, companyToken);
            await Send("GET", $"/api/Companies/{companyId}", 404, token: otherCompanyToken);

            var customerBody = new { customerName = "HTTP Customer", email = "http-customer@example.test", password, address };
            var customer = await Send("POST", "/api/Customer", 201, customerBody);
            var customerId = customer.GetProperty("customerId").GetGuid();
            Check(!customer.TryGetProperty("passwordHash", out _), "Customer signup exposes no password hash");
            await Send("POST", "/api/Customer", 409, customerBody);
            await Send("POST", "/api/Customer", 201, new { customerName = "Other Customer", email = "http-other-customer@example.test", password, address });
            await Send("POST", "/api/Auth/login", 401, new { email = "http-customer@example.test", password = "wrong" });
            var customerToken = await Login("http-customer@example.test");
            var otherCustomerToken = await Login("http-other-customer@example.test");
            var tokenHandler = new JwtSecurityTokenHandler();
            var expired = tokenHandler.CreateToken(new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, customerId.ToString()), new Claim(ClaimTypes.Role, "Customer")]),
                Issuer = "http-integration", Audience = "http-integration",
                NotBefore = DateTime.UtcNow.AddMinutes(-10), IssuedAt = DateTime.UtcNow.AddMinutes(-10), Expires = DateTime.UtcNow.AddMinutes(-1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(start.Environment["JwtConfig__Key"]!)), SecurityAlgorithms.HmacSha512)
            });
            await Send("GET", "/api/Jobs", 401, token: tokenHandler.WriteToken(expired));
            await Send("GET", "/api/Customer", 403, token: customerToken);
            await Send("GET", $"/api/Customer/{customerId}", 404, token: otherCustomerToken);
            await Send("PATCH", $"/api/Companies/{companyId}/Status", 403, new { status = 0 }, customerToken);

            object JobBody(Guid selectedCompany) => new
            { companyId = selectedCompany, customerId = Guid.NewGuid(), jobDescription = "HTTP workflow job", daysWorking = 2,
                startDate = date, endDate = date.AddDays(1), payingMethod = 0, status = 1, address };
            await Send("POST", "/api/Jobs", 403, JobBody(companyId), companyToken);
            await Send("POST", "/api/Jobs", 400, JobBody(Guid.NewGuid()), customerToken);
            await Send("POST", "/api/Jobs", 400, new { companyId = "not-a-guid" }, customerToken);
            var job = await Send("POST", "/api/Jobs", 201, JobBody(companyId), customerToken);
            var jobId = job.GetProperty("jobId").GetGuid();
            Check(job.GetProperty("customerId").GetGuid() == customerId, "Job ownership comes from JWT rather than supplied customer ID");
            await Send("GET", $"/api/Jobs/{jobId}", 404, token: otherCustomerToken);
            await Send("GET", $"/api/Jobs/{jobId}", 404, token: otherCompanyToken);
            await Send("DELETE", $"/api/Jobs/{jobId}", 404, token: otherCustomerToken);
            Check((await Send("GET", "/api/Jobs", 200, token: otherCustomerToken)).GetArrayLength() == 0, "Other customer job list excludes owned job");
            Check((await Send("GET", "/api/Jobs", 200, token: otherCompanyToken)).GetArrayLength() == 0, "Other company job list excludes owned job");
            await Send("POST", "/api/Payment/eft", 409, new { jobId }, customerToken);
            object Quote(decimal amount) => new { quote = amount, endDate = date.AddDays(1), payingMethod = 0, status = 1 };
            await Send("PUT", $"/api/Jobs/{jobId}", 403, Quote(250), customerToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 404, Quote(250), otherCompanyToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 400, Quote(-1), companyToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 200, Quote(250), companyToken);
            Check((await Send("GET", $"/api/Jobs/{jobId}", 200, token: customerToken)).GetProperty("quote").GetDecimal() == 250, "Customer reads company's saved quote");

            object WorkerBody(Guid selectedJob) => new { workerFirstName = "HTTP", workerLastName = "Worker", workerStatus = 0, companyId = otherCompanyId, jobId = selectedJob };
            await Send("POST", "/api/Workers", 403, WorkerBody(jobId), customerToken);
            await Send("POST", "/api/Workers", 400, WorkerBody(jobId), otherCompanyToken);
            await Send("POST", "/api/Workers", 400, WorkerBody(Guid.NewGuid()), companyToken);
            var worker = await Send("POST", "/api/Workers", 201, WorkerBody(jobId), companyToken);
            var workerId = worker.GetProperty("workerId").GetGuid();
            Check(worker.GetProperty("companyId").GetGuid() == companyId && worker.GetProperty("jobId").GetGuid() == jobId, "Worker assigned to owned job; spoofed company ignored");
            await Send("GET", $"/api/Workers/{workerId}", 404, token: otherCompanyToken);
            await Send("PUT", $"/api/Workers/{workerId}", 404, new { workerStatus = 1 }, otherCompanyToken);
            await Send("DELETE", $"/api/Workers/{workerId}", 404, token: otherCompanyToken);
            Check((await Send("GET", "/api/Workers", 200, token: otherCompanyToken)).GetArrayLength() == 0, "Other company's worker list excludes assigned worker");
            await Send("PUT", $"/api/Workers/{workerId}", 400, new { workerStatus = 99 }, companyToken);
            await Send("PUT", $"/api/Workers/{workerId}", 200, new { workerStatus = 1 }, companyToken);

            await Send("POST", "/api/Payment/eft", 403, new { jobId }, companyToken);
            await Send("POST", "/api/Payment/eft", 404, new { jobId }, otherCustomerToken);
            await Send("POST", "/api/Payment/eft", 404, new { jobId = Guid.NewGuid() }, customerToken);
            await Send("POST", "/api/Payment/eft", 400, new { jobId = Guid.Empty }, customerToken);
            await Send("POST", "/api/Payment/eft", 400, new { jobId, transactionReference = new string('r', 101) }, customerToken);
            var payment = await Send("POST", "/api/Payment/eft", 201,
                new { jobId, transactionReference = "  SIMULATED-HTTP  ", amount = 1, status = 2 }, customerToken);
            var paymentId = payment.GetProperty("paymentId").GetGuid();
            Check(payment.GetProperty("amount").GetDecimal() == 250 && payment.GetProperty("status").GetInt32() == 1,
                "Simulated payment uses stored quote and server-controlled Pending status");
            await Send("POST", "/api/Payment/eft", 409, new { jobId }, customerToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 409, Quote(300), companyToken);
            await Send("GET", $"/api/Payment/{paymentId}", 404, token: otherCustomerToken);
            await Send("GET", $"/api/Payment/{paymentId}", 404, token: otherCompanyToken);
            await Send("GET", $"/api/Payment/{paymentId}", 200, token: customerToken);
            await Send("GET", $"/api/Payment/{paymentId}", 200, token: companyToken);
            await Send("GET", "/api/Payment", 403, token: customerToken);
            await Send("PATCH", $"/api/Payment/{paymentId}/status", 403, new { status = 2 }, customerToken);
            await Send("PATCH", $"/api/Payment/{paymentId}/status", 403, new { status = 2 }, companyToken);
            await Send("PATCH", $"/api/Payment/{paymentId}/status", 400, new { status = 99 }, admin);
            await Send("PATCH", $"/api/Payment/{paymentId}/status", 400, new { status = 4 }, admin);
            Check((await Send("GET", $"/api/Jobs/{jobId}", 200, token: customerToken)).GetProperty("amountPaid").GetDecimal() == 0,
                "Pending simulation does not count as paid");
            await Send("PATCH", $"/api/Payment/{paymentId}/status", 200, new { status = 2 }, admin);
            await Send("PATCH", $"/api/Payment/{paymentId}/status", 409, new { status = 3 }, admin);
            foreach (var token in new[] { customerToken, companyToken, admin })
            {
                var saved = await Send("GET", $"/api/Jobs/{jobId}", 200, token: token);
                Check(saved.GetProperty("paymentStatus").GetInt32() == 2 && saved.GetProperty("amountPaid").GetDecimal() == 250,
                    "Customer/company/admin read consistent successful simulation");
            }

            var failedJob = await Send("POST", "/api/Jobs", 201, JobBody(companyId), customerToken);
            var failedJobId = failedJob.GetProperty("jobId").GetGuid();
            await Send("PUT", $"/api/Jobs/{failedJobId}", 200, Quote(250), companyToken);
            var failedPayment = await Send("POST", "/api/Payment/eft", 201, new { jobId = failedJobId }, customerToken);
            await Send("PATCH", $"/api/Payment/{failedPayment.GetProperty("paymentId").GetGuid()}/status", 200, new { status = 3 }, admin);
            var failedRead = await Send("GET", $"/api/Jobs/{failedJobId}", 200, token: customerToken);
            Check(failedRead.GetProperty("paymentStatus").GetInt32() == 3 && failedRead.GetProperty("amountPaid").GetDecimal() == 0,
                "Failed simulation persists without counting as paid");
            await Send("POST", "/api/Payment/eft", 409, new { jobId = failedJobId }, customerToken);

            // Independent context/connection: persisted values, not tracked entities from requests.
            await using (var fresh = new BuildAndHireDbContext(new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql(connectionString).Options))
            {
                var stored = await fresh.Jobs.AsNoTracking().Include(j => j.Payment).Include(j => j.Workers).SingleAsync(j => j.JobId == jobId);
                Check(stored.CustomerId == customerId && stored.CompanyId == companyId && stored.Quote == 250 && stored.StartDate == date,
                    "Fresh PostgreSQL context confirms job ownership, quote and UTC date");
                Check(stored.Payment?.Status == PaymentEnum.Successful && stored.Payment.Amount == 250 && stored.Payment.TransactionReference == "SIMULATED-HTTP",
                    "Fresh PostgreSQL context confirms payment status, amount and trimmed reference");
                Check(stored.Workers.Single().WorkerId == workerId && stored.Workers.Single().WorkerStatus == AccountStatus.InActive,
                    "Fresh PostgreSQL context confirms worker assignment and update");
                var registered = await fresh.Customers.AsNoTracking().SingleAsync(c => c.CustomerId == customerId);
                Check(registered.PasswordHash != password && new BuildAndHire.Infrastructure.Authentication.PasswordService().VerifyPassword(password, registered.PasswordHash),
                    "Fresh PostgreSQL context confirms hashed signup password");
            }
            await Send("PATCH", $"/api/Customer/{customerId}/status", 204, new { status = 1 }, admin);
            await Send("GET", "/api/Jobs", 401, token: customerToken);
            await Send("POST", "/api/Auth/login", 401, new { email = "http-customer@example.test", password });
            await Send("PATCH", $"/api/Companies/{companyId}/Status", 204, new { status = 1 }, admin);
            await Send("GET", "/api/Workers", 401, token: companyToken);
            await Send("POST", "/api/Auth/login", 401, new { email = "http-company@example.test", password });
            Console.WriteLine($"{checks} HTTP workflow checks passed.");
        }
        finally
        {
            if (!process.HasExited) process.Kill(entireProcessTree: true);
            await process.WaitForExitAsync();
            await Task.WhenAll(stdout, stderr);
        }
    }
}
