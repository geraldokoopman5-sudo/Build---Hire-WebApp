# Local API integration

The frontend uses `https://localhost:7172`; Vite runs on `http://localhost:5173` with a fixed port. `BuildAndHireFrontend/.env.development` holds the development API URL. Configure `Cors:AllowedOrigins` for other deployments.

## Database and first administrator

Run commands from the repository root. Configure `ConnectionStrings:DefaultConnection` and `JwtConfig` in local configuration/environment variables before starting. Existing settings are preserved.

Apply migrations without installing EF command-line tools:

```powershell
dotnet run --project './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj' -- --migrate
```

The new migration renames `Workers.WorkerLastNAme` to `WorkerLastName` and `Jobs.Qoute` to `Quote`, preserving values. Historical migrations are unchanged. Normal API startup does not apply migrations.

To create the first SuperAdmin, set these environment variables in the terminal used to run the API:

```powershell
$env:BootstrapAdmin__Enabled = 'true'
$env:BootstrapAdmin__Email = Read-Host 'First SuperAdmin email'
$bootstrapPassword = Read-Host 'First SuperAdmin password (at least 12 characters)' -AsSecureString
$env:BootstrapAdmin__Password = [System.Net.NetworkCredential]::new('', $bootstrapPassword).Password
dotnet run --project './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj' --launch-profile https
```

The password is hashed on the server. Bootstrap skips creation when a SuperAdmin already exists and serializes concurrent bootstrap attempts using a PostgreSQL advisory lock. Missing/invalid credentials fail startup when bootstrap is enabled. No administrator password is committed or supplied by default.

After the first successful startup, stop the API and remove the bootstrap settings from that terminal before restarting normally:

```powershell
Remove-Item Env:BootstrapAdmin__Enabled, Env:BootstrapAdmin__Email, Env:BootstrapAdmin__Password
Remove-Variable bootstrapPassword
dotnet run --project './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj' --launch-profile https
```

If the browser does not trust the local HTTPS certificate, run `dotnet dev-certs https --trust` once. Never point the browser at the HTTP API port and rely on redirection for CORS preflights.

Start the frontend in another terminal:

```powershell
Set-Location './BuildAndHireFrontend'
npm run dev
```

## Contracts and behaviour

- Signup: `POST /api/Customer` or `POST /api/Companies`, with `password` (minimum 12 characters). Account types and initial status are set by the server. Responses contain real IDs and no password/hash.
- Login: `POST /api/Auth/login`. UI uses the returned token, account type, admin role and customer ID. Legacy development tokens are rejected by the UI.
- New companies start Pending. An Admin or SuperAdmin activates them using `PATCH /api/Companies/{id}/Status` with `{ "status": 0 }` and a bearer token. Company details updates cannot change approval status.
- Create Job loads active companies from the API. Its company ID must exist in PostgreSQL. The API derives the customer ID from the authenticated JWT. Job reads/updates/deletes enforce customer/company ownership or an administrator role.
- Customer job lists reload from the API after login and page refresh. Old local job data and generated development customer IDs are no longer used.
- Job API status: Working=1, Unavailable=2, Available=3. UI labels are mapped explicitly in `src/utils/jobStatus.ts`.
- Job fields are `quote`, `workerLastName` (workers), and `payingMethod`. Payment and worker enums have one numeric frontend definition.
- Calendar selections are represented as UTC midnight ISO strings. The API rejects non-UTC job timestamps. Start dates may be today; end dates may equal start dates. PostgreSQL stores UTC timestamps.
- Payments remain simulated. `POST /api/Payment/eft` records a Pending request using the stored job quote and a server-assigned UTC timestamp. Admins review it through `PATCH /api/Payment/{id}/status`; no money is transferred or payment provider introduced.
- All registered request validators execute through an async MVC action filter and return HTTP 400 validation errors. Duplicate records and foreign-key failures receive controlled errors.

Current company jobs, workforce, and administrator flows also use the API. See [BACKEND_VERIFICATION.md](BACKEND_VERIFICATION.md) for the tested scope, results, and remaining workflow limitations. This is not a full authorization/security audit of unrelated endpoints.

## Verification

```powershell
dotnet build './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj'
dotnet run --project './Build&Hire.API/BuildAndHire.RegressionTests/BuildAndHire.RegressionTests.csproj'
npm --prefix './BuildAndHireFrontend' run build
npm --prefix './BuildAndHireFrontend' run lint
```

Run actual PostgreSQL integration checks using a temporary schema in the configured database (the database user needs CREATE SCHEMA permission). Fixtures are removed afterward; existing application tables are not used:

These checks also start a separate loopback API process against the temporary schema and exercise the workflow through real HTTP requests, login tokens, authentication middleware, and request validation. The process is stopped before schema cleanup.

```powershell
dotnet run --project './Build&Hire.API/BuildAndHire.RegressionTests/BuildAndHire.RegressionTests.csproj' -- --postgres-config './Build&Hire.API/Build&Hire.API/appsettings.json'
```

With the HTTPS API running, test CORS, request validation, authentication requirements and OpenAPI contracts:

```powershell
python './Build&Hire.API/BuildAndHire.RegressionTests/http_smoke.py'
```
