# Local API integration

The frontend uses `https://localhost:7172`; Vite runs on `http://localhost:5173` with a fixed port. `BuildAndHireFrontend/.env.development` holds the development API URL. Configure `Cors:AllowedOrigins` for other deployments.

## Database and first administrator

Run commands from the repository root. Configure `ConnectionStrings:DefaultConnection` and `JwtConfig` in ignored `Build&Hire.API/Build&Hire.API/appsettings.Local.json` (Development only) or environment variables before starting. Existing local credentials were preserved in that file; publishable defaults contain no secrets. Environment/command-line settings take precedence. See [DEPLOYMENT.md](DEPLOYMENT.md) for release configuration, health checks, CI and migration/backup instructions.

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
- Job API status: Requested=4, Accepted=5, InProgress=6, Completed=7, Cancelled=8, Rejected=9. Values 1–3 are reserved legacy values. Customer job data and the redesigned customer dashboard support all these states and quote timestamps. Company controls still use their legacy mapping pending their page-by-page update.
- Job fields are `quote`, `workerLastName` (workers), and `payingMethod`. Payment and worker enums have one numeric frontend definition.
- Calendar selections are represented as UTC midnight ISO strings. The API rejects non-UTC job timestamps. Start dates may be today; end dates may equal start dates. PostgreSQL stores UTC timestamps.
- Payments remain simulated. `POST /api/Payment/eft` records a Pending request using the stored job quote and a server-assigned UTC timestamp. Admins review it through `PATCH /api/Payment/{id}/status`; no money is transferred or payment provider introduced.
- All registered request validators execute through an async MVC action filter and return HTTP 400 validation errors. Duplicate records and foreign-key failures receive controlled errors.

Current company jobs, workforce, and administrator flows also use the API. See [BACKEND_VERIFICATION.md](BACKEND_VERIFICATION.md) for the tested scope, results, and remaining workflow limitations. This is not a full authorization/security audit of unrelated endpoints.

## Simulated payments

No payment provider, bank instructions, or actual transfers are involved. The EFT-named endpoint records a simulation only.

- Only the owning customer can create a request, after accepting the company's quote. The server supplies the amount from that quote, Pending status, UTC timestamp, and EFT method; client-supplied amounts/statuses are ignored.
- One payment record is allowed per job. Concurrent requests produce one creation and one 409 conflict. A failed record still blocks a new request; retry/reset behavior has not been added.
- Only Admin/SuperAdmin can set a Pending simulation to Successful or Failed through `PATCH /api/Payment/{id}/status`. The update is atomic, so conflicting reviews cannot overwrite one another. Subsequent reviews return 409; unsupported outcomes return 400.
- Customers and companies can read payments belonging to their jobs. Admins can list/read all payments. Successful payments count toward `amountPaid`; Pending and Failed count as zero.
- Payment creation records EFT on the associated job. Once a payment exists, job edits cannot change its quote or payment method.

## Job and quote lifecycle

New jobs always start Requested; the server ignores a client-supplied creation status. Company acceptance and customer quote acceptance are separate decisions.

| Action | Endpoint | Role and rule |
| --- | --- | --- |
| Accept job | `POST /api/Jobs/{id}/accept` | Owning company; Requested → Accepted |
| Reject job | `POST /api/Jobs/{id}/reject` | Owning company; Requested → Rejected |
| Send quote | `POST /api/Jobs/{id}/quote` with `{ "quote": 250 }` | Owning company; Accepted job, positive amount with at most two decimal places |
| Accept quote | `POST /api/Jobs/{id}/quote/accept` with `{ "quote": 250 }` | Owning customer confirms the current sent amount |
| Start work | `POST /api/Jobs/{id}/start` | Owning company; Accepted → InProgress, requires customer quote acceptance |
| Complete | `POST /api/Jobs/{id}/complete` | Owning company; InProgress → Completed |
| Cancel | `POST /api/Jobs/{id}/cancel` | Owning customer or admin; Requested/Accepted → Cancelled, requires no payment record |

Job responses include UTC `acceptedAt`, `quoteSentAt`, and `quoteAcceptedAt`. Quote amounts can change before customer acceptance; accepting a stale amount returns 409. After acceptance or a payment record, the quote is locked. Repeated acceptance preserves its original timestamp. Simulated EFT requests require customer quote acceptance; successful payment is not a prerequisite for starting work.

`PUT /api/Jobs/{id}` edits details only while Accepted. `status` is optional and, if supplied, must match the current status; lifecycle changes use the endpoints above. Changing the quote to a positive amount also publishes it. Only the company can change the price. `DELETE /api/Jobs/{id}` now cancels and retains the job record. Completion/cancellation release assigned workers; workers may only be assigned to Accepted or InProgress jobs.

Apply `JobAndQuoteLifecycle` through the migration command above. Legacy Unavailable jobs become Cancelled; other legacy jobs become Accepted if they already have `acceptedAt`, otherwise Requested. Existing positive quotes are treated as previously sent, including jobs with payment records, but no customer agreement is inferred. Rollback is blocked if customer quote acceptance, advanced lifecycle states, or unassigned workers would lose history. Backend operations are available through the API. The customer dashboard displays these states; lifecycle action controls on other pages still need their separate updates.

## Backend validation and error handling

Registered validators reject invalid requests with HTTP 400 and field errors. Services also reject missing addresses when called directly. Jobs can be created without a client status; the server supplies Requested. Read contracts allow a missing result, while missing update/delete targets raise controlled exceptions that map to HTTP 404.

Known validation, missing-record, uniqueness, and foreign-key exceptions return appropriate 400/404/409 ProblemDetails responses. Unexpected MVC exceptions return generic HTTP 500 ProblemDetails with `traceId`; private exception details are logged on the server rather than sent to clients. The global exception handler covers exceptions outside MVC actions too. Existing explicit controller validation/conflict responses retain their response formats.

A complete backend rebuild has zero errors and two CS8981 naming warnings from the original `enumtype` migration/designer. The 25 nullability warnings have been resolved without suppressing them. Historical migrations remain unchanged; subsequent workflow migrations are separate files.

Frontend redesign is proceeding page by page after approval of each preview. The customer dashboard at `/my-jobs` has responsive navigation, live project summaries, pending-quote reminders, search, status filters and ZAR amounts. Quote review at `/quotes/:id` now requires agreement to the displayed amount before calling quote acceptance, then allows one simulated payment request. Project details at `/my-jobs/:jobId` shows saved quote timestamps, project progress and separate payment outcomes, with confirmed cancellation only for requested/accepted jobs without a payment record. Mutations read back the saved job; conflicts offer refresh/retry. Login and global styles are unchanged. Keep demo assets such as `src/components/CardPaymentModal` and `src/utils/simulatePayment.ts`.

## Verification

### Company workforce and job acceptance

Companies can create workforce members without assigning a job. `jobId` is nullable in worker requests and responses. Supplying an empty GUID is invalid; omit `jobId` or send `null` for an unassigned worker.

- `POST /api/Workers`: create a worker with `workerFirstName`, `workerLastName`, and `workerStatus`; optionally supply `jobId`. Company ownership is derived from the JWT. If a job is supplied, it must belong to that company and have been accepted.
- `POST /api/Jobs/{id}/accept`: the owning company explicitly accepts a job. Returns `jobId` and server-assigned UTC `acceptedAt`. Repeated acceptance preserves the original timestamp. Customers and admins cannot accept on behalf of a company.
- `PATCH /api/Workers/{id}/job` with `{ "jobId": "<accepted-job-guid>" }`: assign or reassign the company's worker to one of its accepted jobs.
- `PATCH /api/Workers/{id}/job` with `{ "jobId": null }`: unassign a worker while keeping them in the company's workforce. The `jobId` property must be present to avoid accidental unassignment.
- `PUT /api/Workers/{id}` continues to update worker status independently of assignment.

Apply the `AllowUnassignedWorkersAndJobAcceptance` migration using the migration command above before running the updated API against an existing database. It preserves existing assignments and records existing jobs with workers as accepted at migration time. Existing jobs without workers require explicit acceptance. Rollback refuses to proceed while unassigned workers exist.

Customer quote acceptance is available on the redesigned quote review page. Company controls for job acceptance, unassigned workforce creation, and reassignment still await their own page updates; these operations are available through the API.

### Test commands

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
