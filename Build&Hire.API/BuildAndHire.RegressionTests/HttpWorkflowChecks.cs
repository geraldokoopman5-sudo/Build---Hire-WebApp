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
        start.Environment["ASPNETCORE_HTTPS_PORT"] = "443";
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
        // Simulate HTTPS termination by a trusted loopback reverse proxy.
        client.DefaultRequestHeaders.Add("X-Forwarded-Proto", "https");
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
        async Task<int> RaceStatus(string path, string token, object? body = null, string method = "POST")
        {
            using var request = new HttpRequestMessage(new HttpMethod(method), path);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            if (body != null) request.Content = JsonContent.Create(body);
            using var response = await client.SendAsync(request);
            return (int)response.StatusCode;
        }
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
            using (var unproxied = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false })
                { BaseAddress = client.BaseAddress, Timeout = TimeSpan.FromSeconds(10) })
            {
                using var liveProbe = await unproxied.GetAsync("/health/live");
                Check(liveProbe.StatusCode == HttpStatusCode.OK, "Private HTTP health probe bypasses HTTPS redirection");
                using var insecureApi = await unproxied.GetAsync("/api/Jobs");
                Check(insecureApi.StatusCode == HttpStatusCode.TemporaryRedirect && insecureApi.Headers.Location?.Scheme == "https",
                    "Unforwarded HTTP API request redirects to HTTPS");
            }
            await Send("GET", "/health/live", 200);
            await Send("GET", "/health/ready", 200);
            // Test only the disposable schema; restore its migration history before continuing.
            await using (var healthConnection = new NpgsqlConnection(connectionString))
            {
                await healthConnection.OpenAsync();
                string migration;
                string version;
                await using (var latest = new NpgsqlCommand("SELECT \"MigrationId\", \"ProductVersion\" FROM \"__EFMigrationsHistory\" ORDER BY \"MigrationId\" DESC LIMIT 1", healthConnection))
                await using (var reader = await latest.ExecuteReaderAsync())
                {
                    await reader.ReadAsync();
                    migration = reader.GetString(0);
                    version = reader.GetString(1);
                }
                await using var remove = new NpgsqlCommand("DELETE FROM \"__EFMigrationsHistory\" WHERE \"MigrationId\" = @id", healthConnection);
                remove.Parameters.AddWithValue("id", migration);
                await remove.ExecuteNonQueryAsync();
                try
                {
                    await Send("GET", "/health/ready", 503);
                    await Send("GET", "/health/live", 200);
                }
                finally
                {
                    await using var restore = new NpgsqlCommand("INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES (@id, @version)", healthConnection);
                    restore.Parameters.AddWithValue("id", migration);
                    restore.Parameters.AddWithValue("version", version);
                    await restore.ExecuteNonQueryAsync();
                }
            }
            await Send("GET", "/health/ready", 200);
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
            var missingId = Guid.NewGuid();
            await Send("GET", $"/api/Customer/{missingId}", 404, token: admin);
            await Send("PUT", $"/api/Customer/{missingId}", 404,
                new { customerName = "Missing", email = "missing@example.test", address }, admin);
            await Send("DELETE", $"/api/Customer/{missingId}", 404, token: admin);
            await Send("GET", $"/api/Companies/{missingId}", 404, token: admin);
            await Send("PUT", $"/api/Companies/{missingId}", 404, new
                { companyName = "Missing", companyEmail = "missing-company@example.test", registrationNumber = "1234567890", taxNumber = "0123456789", address }, admin);
            await Send("DELETE", $"/api/Companies/{missingId}", 404, token: admin);

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
            await Send("POST", "/api/Customer", 400, new { customerName = "No Address", email = "no-address@example.test", password });
            await Send("PUT", $"/api/Customer/{customerId}", 400, new { customerName = "No Address", email = "http-customer@example.test" }, customerToken);
            await Send("PUT", $"/api/Companies/{companyId}", 400, new
                { companyName = "No Address", companyEmail = "http-company@example.test", registrationNumber = "1234567890", taxNumber = "0123456789" }, companyToken);
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

            object JobBody(Guid selectedCompany, int? paymentMethod = 0) => new
            { companyId = selectedCompany, customerId = Guid.NewGuid(), jobDescription = "HTTP workflow job", daysWorking = 2,
                startDate = date, endDate = date.AddDays(1), payingMethod = paymentMethod, status = 1, address };
            await Send("POST", "/api/Jobs", 403, JobBody(companyId), companyToken);
            await Send("POST", "/api/Jobs", 400, JobBody(Guid.NewGuid()), customerToken);
            await Send("POST", "/api/Jobs", 400, new { companyId = "not-a-guid" }, customerToken);
            var job = await Send("POST", "/api/Jobs", 201, JobBody(companyId), customerToken);
            var jobId = job.GetProperty("jobId").GetGuid();
            await Send("POST", "/api/Jobs", 400, new
                { companyId, jobDescription = "No Address", daysWorking = 2, startDate = date, endDate = date.AddDays(1) }, customerToken);
            var noStatusJob = await Send("POST", "/api/Jobs", 201, new
                { companyId, jobDescription = "Default Status", daysWorking = 2, startDate = date, endDate = date.AddDays(1), address }, customerToken);
            Check(noStatusJob.GetProperty("status").GetInt32() == 4, "Job creation without client status defaults to server-controlled Requested");
            await Send("GET", $"/api/Workers/{missingId}", 404, token: companyToken);
            await Send("PUT", $"/api/Workers/{missingId}", 404, new { workerStatus = 0 }, companyToken);
            await Send("DELETE", $"/api/Workers/{missingId}", 404, token: companyToken);
            Check(job.GetProperty("customerId").GetGuid() == customerId, "Job ownership comes from JWT rather than supplied customer ID");
            await Send("GET", $"/api/Jobs/{jobId}", 404, token: otherCustomerToken);
            await Send("GET", $"/api/Jobs/{jobId}", 404, token: otherCompanyToken);
            await Send("DELETE", $"/api/Jobs/{jobId}", 404, token: otherCustomerToken);
            Check((await Send("GET", "/api/Jobs", 200, token: otherCustomerToken)).GetArrayLength() == 0, "Other customer job list excludes owned job");
            Check((await Send("GET", "/api/Jobs", 200, token: otherCompanyToken)).GetArrayLength() == 0, "Other company job list excludes owned job");
            await Send("POST", "/api/Payment/eft", 409, new { jobId }, customerToken);
            object Quote(decimal amount) => new { quote = amount, endDate = date.AddDays(1), payingMethod = 0, status = 5 };
            await Send("PUT", $"/api/Jobs/{jobId}", 403, Quote(250), customerToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 404, Quote(250), otherCompanyToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 400, Quote(-1), companyToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 409, Quote(250), companyToken);
            Check(job.GetProperty("status").GetInt32() == 4, "Job creation sets Requested regardless of client status");

            object WorkerBody(Guid selectedJob) => new { workerFirstName = "HTTP", workerLastName = "Worker", workerStatus = 0, companyId = otherCompanyId, jobId = selectedJob };
            Check(job.GetProperty("acceptedAt").ValueKind == JsonValueKind.Null, "New job starts without company acceptance");
            await Send("POST", "/api/Workers", 409, WorkerBody(jobId), companyToken);
            var workforceWorker = await Send("POST", "/api/Workers", 201, new
                { workerFirstName = "Workforce", workerLastName = "Unassigned", workerStatus = 0, companyId = otherCompanyId }, companyToken);
            var workforceWorkerId = workforceWorker.GetProperty("workerId").GetGuid();
            Check(workforceWorker.GetProperty("jobId").ValueKind == JsonValueKind.Null && workforceWorker.GetProperty("companyId").GetGuid() == companyId,
                "Company adds workforce worker without any job and cannot spoof ownership");
            var explicitlyUnassigned = await Send("POST", "/api/Workers", 201, new
                { workerFirstName = "Explicit", workerLastName = "Unassigned", workerStatus = 0, jobId = (Guid?)null }, companyToken);
            Check(explicitlyUnassigned.GetProperty("jobId").ValueKind == JsonValueKind.Null, "Explicit null job ID also creates an unassigned worker");
            await using (var fresh = new BuildAndHireDbContext(new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql(connectionString).Options))
                Check(await fresh.Workers.AnyAsync(w => w.WorkerId == workforceWorkerId && w.JobId == null), "Unassigned workforce worker persists in PostgreSQL");
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 409, new { jobId }, companyToken);
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 403, new { jobId }, customerToken);
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 404, new { jobId }, otherCompanyToken);
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 400, new { }, companyToken);
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 400, new { jobId = Guid.Empty }, companyToken);
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 400, new { jobId = Guid.NewGuid() }, companyToken);
            await Send("POST", $"/api/Jobs/{jobId}/accept", 401);
            await Send("POST", $"/api/Jobs/{jobId}/accept", 403, token: customerToken);
            await Send("POST", $"/api/Jobs/{jobId}/accept", 403, token: admin);
            await Send("POST", $"/api/Jobs/{jobId}/accept", 404, token: otherCompanyToken);
            await Send("POST", $"/api/Jobs/{Guid.NewGuid()}/accept", 404, token: companyToken);
            var accepted = await Send("POST", $"/api/Jobs/{jobId}/accept", 200, token: companyToken);
            var acceptedAt = accepted.GetProperty("acceptedAt").GetDateTime();
            Check(acceptedAt.Kind == DateTimeKind.Utc, "Company acceptance receives server UTC timestamp");
            var acceptedAgain = await Send("POST", $"/api/Jobs/{jobId}/accept", 200, token: companyToken);
            Check(acceptedAgain.GetProperty("acceptedAt").GetDateTime() == acceptedAt, "Repeated acceptance preserves original timestamp");
            Check((await Send("GET", $"/api/Jobs/{jobId}", 200, token: customerToken)).GetProperty("acceptedAt").GetDateTime() == acceptedAt,
                "Customer sees company acceptance on job read");
            await Send("POST", $"/api/Jobs/{jobId}/start", 409, token: companyToken);
            await Send("POST", $"/api/Jobs/{jobId}/quote/accept", 409, new { quote = 250 }, customerToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 200, Quote(250), companyToken);
            Check((await Send("GET", $"/api/Jobs/{jobId}", 200, token: customerToken)).GetProperty("quoteSentAt").ValueKind == JsonValueKind.String,
                "Saving a positive company quote publishes it to the customer");
            await Send("POST", $"/api/Jobs/{jobId}/start", 409, token: companyToken);
            await Send("POST", "/api/Payment/eft", 409, new { jobId }, customerToken);
            await Send("POST", $"/api/Jobs/{jobId}/quote/accept", 403, new { quote = 250 }, companyToken);
            await Send("POST", $"/api/Jobs/{jobId}/quote/accept", 404, new { quote = 250 }, otherCustomerToken);
            await Send("POST", $"/api/Jobs/{jobId}/quote/accept", 400, new { }, customerToken);
            await Send("POST", $"/api/Jobs/{jobId}/quote/accept", 409, new { quote = 249 }, customerToken);
            var agreedQuote = await Send("POST", $"/api/Jobs/{jobId}/quote/accept", 200, new { quote = 250 }, customerToken);
            var quoteAcceptedAt = agreedQuote.GetProperty("quoteAcceptedAt").GetDateTime();
            Check((await Send("POST", $"/api/Jobs/{jobId}/quote/accept", 200, new { quote = 250 }, customerToken))
                .GetProperty("quoteAcceptedAt").GetDateTime() == quoteAcceptedAt, "Repeated quote acceptance preserves consent timestamp");
            await Send("POST", $"/api/Jobs/{jobId}/quote", 409, new { quote = 300 }, companyToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 409, Quote(300), companyToken);
            var assigned = await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 200, new { jobId }, companyToken);
            Check(assigned.GetProperty("jobId").GetGuid() == jobId, "Workforce worker can be assigned after company accepts job");
            var unassigned = await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 200, new { jobId = (Guid?)null }, companyToken);
            Check(unassigned.GetProperty("jobId").ValueKind == JsonValueKind.Null, "Company can return worker to unassigned workforce");
            var foreignJob = await Send("POST", "/api/Jobs", 201, JobBody(otherCompanyId), customerToken);
            var foreignJobId = foreignJob.GetProperty("jobId").GetGuid();
            await Send("POST", $"/api/Jobs/{foreignJobId}/accept", 200, token: otherCompanyToken);
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 400, new { jobId = foreignJobId }, companyToken);
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
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 409, new { jobId = failedJobId }, companyToken);
            await Send("POST", $"/api/Jobs/{failedJobId}/accept", 200, token: companyToken);
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 200, new { jobId }, companyToken);
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 200, new { jobId = failedJobId }, companyToken);
            await using (var fresh = new BuildAndHireDbContext(new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql(connectionString).Options))
                Check(await fresh.Workers.AnyAsync(w => w.WorkerId == workforceWorkerId && w.JobId == failedJobId), "Reassignment to another accepted job persists in PostgreSQL");
            await Send("PATCH", $"/api/Workers/{workforceWorkerId}/job", 200, new { jobId = (Guid?)null }, companyToken);
            await Send("PUT", $"/api/Jobs/{failedJobId}", 200, Quote(250), companyToken);
            await Send("POST", $"/api/Jobs/{failedJobId}/quote/accept", 200, new { quote = 250 }, customerToken);
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
                Check(stored.AcceptedAt == acceptedAt && await fresh.Workers.AnyAsync(w => w.WorkerId == workforceWorkerId && w.JobId == null),
                    "Fresh PostgreSQL context confirms acceptance and final unassignment");
                var registered = await fresh.Customers.AsNoTracking().SingleAsync(c => c.CustomerId == customerId);
                Check(registered.PasswordHash != password && new BuildAndHire.Infrastructure.Authentication.PasswordService().VerifyPassword(password, registered.PasswordHash),
                    "Fresh PostgreSQL context confirms hashed signup password");
            }
            await Send("POST", $"/api/Jobs/{jobId}/start", 403, token: customerToken);
            await Send("POST", $"/api/Jobs/{jobId}/start", 404, token: otherCompanyToken);
            await Send("POST", $"/api/Jobs/{jobId}/complete", 409, token: companyToken);
            await Send("PUT", $"/api/Jobs/{jobId}", 409, new { quote = 250, endDate = date.AddDays(1), status = 7, payingMethod = 0 }, companyToken);
            await Send("POST", $"/api/Jobs/{jobId}/start", 200, token: companyToken);
            Check((await Send("GET", $"/api/Jobs/{jobId}", 200, token: customerToken)).GetProperty("status").GetInt32() == 6,
                "Accepted quote allows job to enter InProgress");
            await Send("POST", $"/api/Jobs/{jobId}/cancel", 409, token: customerToken);
            await Send("POST", $"/api/Jobs/{jobId}/reject", 409, token: companyToken);
            await Send("POST", $"/api/Jobs/{jobId}/complete", 200, token: companyToken);
            var completed = await Send("GET", $"/api/Jobs/{jobId}", 200, token: customerToken);
            Check(completed.GetProperty("status").GetInt32() == 7 && completed.GetProperty("quoteAcceptedAt").GetDateTime() == quoteAcceptedAt,
                "Completion preserves customer quote acceptance");
            Check((await Send("GET", $"/api/Workers/{workerId}", 200, token: companyToken)).GetProperty("jobId").ValueKind == JsonValueKind.Null,
                "Completed job releases its workers back to workforce");
            await Send("POST", $"/api/Jobs/{jobId}/start", 409, token: companyToken);
            await Send("POST", $"/api/Jobs/{jobId}/accept", 409, token: companyToken);
            await Send("POST", $"/api/Jobs/{jobId}/quote", 409, new { quote = 300 }, companyToken);
            await Send("PATCH", $"/api/Workers/{workerId}/job", 409, new { jobId }, companyToken);

            var rejectJobId = (await Send("POST", "/api/Jobs", 201, JobBody(companyId), customerToken)).GetProperty("jobId").GetGuid();
            await Send("POST", $"/api/Jobs/{rejectJobId}/reject", 403, token: customerToken);
            await Send("POST", $"/api/Jobs/{rejectJobId}/reject", 404, token: otherCompanyToken);
            await Send("POST", $"/api/Jobs/{rejectJobId}/quote", 409, new { quote = 100 }, companyToken);
            await Send("POST", $"/api/Jobs/{rejectJobId}/reject", 200, token: companyToken);
            Check((await Send("GET", $"/api/Jobs/{rejectJobId}", 200, token: customerToken)).GetProperty("status").GetInt32() == 9,
                "Company rejection persists and remains visible to customer");
            await Send("POST", $"/api/Jobs/{rejectJobId}/accept", 409, token: companyToken);
            await Send("POST", $"/api/Jobs/{rejectJobId}/quote/accept", 409, new { quote = 100 }, customerToken);
            await Send("POST", "/api/Workers", 409, WorkerBody(rejectJobId), companyToken);

            var cancelJobId = (await Send("POST", "/api/Jobs", 201, JobBody(companyId), customerToken)).GetProperty("jobId").GetGuid();
            await Send("POST", $"/api/Jobs/{cancelJobId}/accept", 200, token: companyToken);
            await Send("POST", $"/api/Jobs/{cancelJobId}/quote", 400, new { quote = 10.001 }, companyToken);
            await Send("POST", $"/api/Jobs/{cancelJobId}/quote", 403, new { quote = 100 }, customerToken);
            await Send("POST", $"/api/Jobs/{cancelJobId}/quote", 200, new { quote = 100 }, companyToken);
            await Send("POST", $"/api/Jobs/{cancelJobId}/quote", 200, new { quote = 200 }, companyToken);
            await Send("POST", $"/api/Jobs/{cancelJobId}/quote/accept", 409, new { quote = 100 }, customerToken);
            await Send("PATCH", $"/api/Workers/{workerId}/job", 200, new { jobId = cancelJobId }, companyToken);
            await Send("POST", $"/api/Jobs/{cancelJobId}/cancel", 404, token: otherCustomerToken);
            await Send("DELETE", $"/api/Jobs/{cancelJobId}", 200, token: customerToken);
            Check((await Send("GET", $"/api/Jobs/{cancelJobId}", 200, token: customerToken)).GetProperty("status").GetInt32() == 8,
                "Cancellation keeps the job record and marks Cancelled");
            Check((await Send("GET", $"/api/Workers/{workerId}", 200, token: companyToken)).GetProperty("jobId").ValueKind == JsonValueKind.Null,
                "Cancellation releases assigned workers");
            await Send("POST", $"/api/Jobs/{cancelJobId}/accept", 409, token: companyToken);
            await Send("POST", $"/api/Jobs/{failedJobId}/cancel", 409, token: customerToken);
            await using (var fresh = new BuildAndHireDbContext(new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql(connectionString).Options))
                Check(await fresh.Jobs.AnyAsync(j => j.JobId == jobId && j.Status == JobEnum.Completed && j.QuoteAcceptedAt != null)
                    && await fresh.Jobs.AnyAsync(j => j.JobId == rejectJobId && j.Status == JobEnum.Rejected)
                    && await fresh.Jobs.AnyAsync(j => j.JobId == cancelJobId && j.Status == JobEnum.Cancelled),
                    "Fresh PostgreSQL context confirms completed, rejected and cancelled lifecycle states");
            var raceJobId = (await Send("POST", "/api/Jobs", 201, JobBody(companyId), customerToken)).GetProperty("jobId").GetGuid();
            var decisions = await Task.WhenAll(RaceStatus($"/api/Jobs/{raceJobId}/accept", companyToken),
                RaceStatus($"/api/Jobs/{raceJobId}/reject", companyToken));
            Check(decisions.Order().SequenceEqual(new[] { 200, 409 }), "Competing company acceptance/rejection permits only one decision");
            var quoteRaceId = (await Send("POST", "/api/Jobs", 201, JobBody(companyId, 1), customerToken)).GetProperty("jobId").GetGuid();
            await Send("POST", $"/api/Jobs/{quoteRaceId}/accept", 200, token: companyToken);
            await Send("POST", $"/api/Jobs/{quoteRaceId}/quote", 200, new { quote = 100 }, companyToken);
            var quoteRace = await Task.WhenAll(RaceStatus($"/api/Jobs/{quoteRaceId}/quote/accept", customerToken, new { quote = 100 }),
                RaceStatus($"/api/Jobs/{quoteRaceId}/quote", companyToken, new { quote = 200 }));
            Check(quoteRace.Order().SequenceEqual(new[] { 200, 409 }), "Quote change and customer consent cannot both succeed for different prices");
            var quoteRaceSaved = await Send("GET", $"/api/Jobs/{quoteRaceId}", 200, token: customerToken);
            Check(quoteRace[0] == 200
                ? quoteRaceSaved.GetProperty("quote").GetDecimal() == 100 && quoteRaceSaved.GetProperty("quoteAcceptedAt").ValueKind == JsonValueKind.String
                : quoteRaceSaved.GetProperty("quote").GetDecimal() == 200 && quoteRaceSaved.GetProperty("quoteAcceptedAt").ValueKind == JsonValueKind.Null,
                "Competing quote updates preserve the exact amount the customer agreed to");
            await Send("POST", $"/api/Jobs/{quoteRaceId}/quote/accept", 200,
                new { quote = quoteRaceSaved.GetProperty("quote").GetDecimal() }, customerToken);
            var concurrentPayments = await Task.WhenAll(RaceStatus("/api/Payment/eft", customerToken, new { jobId = quoteRaceId }),
                RaceStatus("/api/Payment/eft", customerToken, new { jobId = quoteRaceId }));
            Check(concurrentPayments.Order().SequenceEqual(new[] { 201, 409 }), "Concurrent new payment requests create exactly one simulated payment");
            await using (var fresh = new BuildAndHireDbContext(new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql(connectionString).Options))
                Check(await fresh.Payment.CountAsync(p => p.JobId == quoteRaceId) == 1, "Concurrent payment creation persists only one payment record");
            var pendingList = await Send("GET", "/api/Payment", 200, token: admin);
            var reviewId = pendingList.EnumerateArray().Single(p => p.GetProperty("jobId").GetGuid() == quoteRaceId).GetProperty("paymentId").GetGuid();
            await Send("PATCH", $"/api/Payment/{reviewId}/status", 401, new { status = 2 });
            await Send("PATCH", $"/api/Payment/{Guid.NewGuid()}/status", 404, new { status = 2 }, admin);
            await Send("PATCH", $"/api/Payment/{reviewId}/status", 400, new { status = 1 }, admin);
            await Send("GET", "/api/Payment", 403, token: companyToken);
            var reviews = await Task.WhenAll(RaceStatus($"/api/Payment/{reviewId}/status", admin, new { status = 2 }, "PATCH"),
                RaceStatus($"/api/Payment/{reviewId}/status", superAdmin, new { status = 3 }, "PATCH"));
            Check(reviews.Order().SequenceEqual(new[] { 200, 409 }), "Competing simulated payment reviews allow exactly one final outcome");
            var finalStatus = reviews[0] == 200 ? 2 : 3;
            var expectedAmount = finalStatus == 2 ? quoteRaceSaved.GetProperty("quote").GetDecimal() : 0;
            await Send("PUT", $"/api/Jobs/{quoteRaceId}", 409,
                new { quote = quoteRaceSaved.GetProperty("quote").GetDecimal(), endDate = date.AddDays(1), status = 5, payingMethod = 1 }, companyToken);
            foreach (var token in new[] { customerToken, companyToken, admin, superAdmin })
            {
                var paymentRead = await Send("GET", $"/api/Payment/{reviewId}", 200, token: token);
                Check(paymentRead.GetProperty("status").GetInt32() == finalStatus
                    && paymentRead.GetProperty("amount").GetDecimal() == quoteRaceSaved.GetProperty("quote").GetDecimal(),
                    "All permitted roles read the same simulated payment outcome and quoted amount");
                var jobRead = await Send("GET", $"/api/Jobs/{quoteRaceId}", 200, token: token);
                Check(jobRead.GetProperty("paymentStatus").GetInt32() == finalStatus
                    && jobRead.GetProperty("amountPaid").GetDecimal() == expectedAmount
                    && jobRead.GetProperty("payingMethod").GetInt32() == 0,
                    "Job payment status, amount paid and method agree with the final simulated outcome");
            }
            await Send("PATCH", $"/api/Payment/{reviewId}/status", 409, new { status = finalStatus }, admin);
            await Send("PATCH", $"/api/Payment/{reviewId}/status", 409, new { status = finalStatus == 2 ? 3 : 2 }, superAdmin);
            await using (var fresh = new BuildAndHireDbContext(new DbContextOptionsBuilder<BuildAndHireDbContext>().UseNpgsql(connectionString).Options))
                Check(await fresh.Payment.AnyAsync(p => p.PaymentId == reviewId && (int)p.Status == finalStatus
                    && p.Amount == quoteRaceSaved.GetProperty("quote").GetDecimal()),
                    "Fresh PostgreSQL context confirms the winning payment review cannot be overwritten");
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
