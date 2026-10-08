# Backend integration verification

Verified on 8 October 2026 against the current working tree. Payments remain simulated; no payment provider or frontend changes were introduced.

## Results

- 46 regression checks passed, including production configuration validation and unavailable-database readiness.
- 40 PostgreSQL integration checks passed, including migration upgrade/rollback safeguards.
- 267 HTTP workflow assertions passed against the actual API process, including authentication middleware, request validation, liveness, pending-migration readiness and trusted proxy HTTPS handling.
- Release packaging passed; local/development settings are excluded and public defaults contain no database credentials or JWT signing key.
- The generated test schema was removed after completion. Application tables were not used for fixtures.

The tested flow is company signup, administrator approval, company/customer login, customer job creation, company quote and explicit acceptance, worker creation and assignment, simulated EFT request, and administrator review. Successful payment status and amount paid are consistent when read by the customer, company, and administrator. Pending and failed payments do not count as paid.

Companies can create workers with no job, explicitly accept their own jobs, and assign/reassign workers only to their accepted jobs. Unassignment preserves the workforce record. Tests verify missing/null job IDs on creation, invalid assignment requests, ownership restrictions, assignment before acceptance, repeated acceptance, and persistence of acceptance/assignment/unassignment.

The migration preserves existing worker assignments and backfills acceptance only for already staffed jobs. Its rollback refuses to proceed while unassigned workers exist; tests verify that a refused rollback preserves the schema and migration history.

Fresh PostgreSQL contexts verify saved ownership, quote, UTC dates, worker assignment/status, hashed signup passwords, and payment amount/status/reference.

Lifecycle checks cover company rejection, sending/replacing quotes, customer acceptance of the current amount, quote locking, starting only after quote acceptance, completion, and cancellation with job-record retention. Completion/cancellation release workers; closed jobs reject new assignments. Concurrent company acceptance/rejection yields one successful decision. Competing quote changes/customer consent preserve the agreed price. Concurrent new payment requests produce exactly one simulated payment record.

Simulated payment review uses an atomic Pending-to-Successful/Failed update. Concurrent admin/super-admin reviews produce one success and one conflict; neither can overwrite the final outcome afterward. Customers, companies, admins, and super-admins read the same saved amount/status, and job totals count only successful payments. The EFT simulation also records EFT on the job and prevents later payment-method edits. Tests cover unauthenticated/unauthorized reviews, missing IDs, forbidden status transitions, fresh database reads, and consistency across permitted roles.

Negative cases include duplicate signup/payment requests, invalid identifiers and enums, negative quotes, payment before quoting, quote changes after payment creation, attempts to change completed payment status, spoofed owner IDs, unrelated account reads/writes/deletes, and restricted role actions. Invalid/expired tokens and previously issued tokens for subsequently disabled accounts are rejected. Allowed and unconfigured CORS origins are checked.

Validation/error checks cover missing addresses, creation without a client status, and unknown customer/company/worker records. Nullable read contracts now describe missing records accurately; failed updates/deletes raise controlled missing-record exceptions rather than returning null or dereferencing it. Service-layer address guards supplement the HTTP validators. Unexpected MVC exceptions return a generic HTTP 500 ProblemDetails response with a trace ID and log details on the server; focused exception-filter checks confirm private exception text is not returned. A global exception handler also covers errors outside MVC actions.

The regression project and all referenced backend projects rebuild successfully with zero errors. Compiler warnings fell from 27 to 2 after fixing 25 nullability warnings. The remaining CS8981 warnings concern the lowercase `enumtype` class in the original migration and its designer; these historical files were left intact. Frontend files and demo simulation assets were not changed by this cleanup.

## Findings and limits

- The tested backend workflow passes; this is not a claim that every endpoint or business rule is fully verified.
- Only one payment record is allowed per job. Even a failed simulated payment prevents another request for that job; retry/reset behavior needs a separate decision.
- Worker creation no longer requires a job. Assignment and reassignment use a separate endpoint and require owning-company acceptance. Frontend controls remain deferred.
- Job states are Requested, Accepted, InProgress, Completed, Cancelled, and Rejected. Company acceptance and customer quote agreement have separate UTC timestamps. Quotes can be replaced before agreement; a customer-driven negotiation/revision-request workflow is not included.
- Migration tests confirm preservation of existing assignments, explicit legacy-state mapping, and exposure of old positive quotes without inventing customer consent. Apply the included migrations to an application database before using the updated API. Its frontend controls and status mapping still need the deferred update.
- Cancellation is restricted to Requested/Accepted jobs with no payment record. In-progress cancellation and payment/refund resolution require separate business decisions.
- HTTP checks run on an isolated loopback HTTP listener. Browser behavior, HTTPS certificate trust, deployment configuration, restart recovery, and concurrency cases beyond those listed above were not verified here.
- The older HTTPS smoke script was corrected to check authenticated `POST /api/Payment/eft` rather than the removed `POST /api/Payment` route. Its standalone HTTPS run remains separate; the new suite verifies overlapping middleware behavior over loopback HTTP.

## Repeat the checks

From the repository root, with PostgreSQL available and the configured database user allowed to create schemas:

```powershell
dotnet run --project './Build&Hire.API/BuildAndHire.RegressionTests/BuildAndHire.RegressionTests.csproj' --no-restore -- --postgres-config './Build&Hire.API/Build&Hire.API/appsettings.json'
```

The runner creates a random `integration_<GUID>` schema and applies migrations there. The child API receives only that schema's connection string plus test JWT settings through environment variables. Test credentials and tokens are not printed. The child process is stopped before the enclosing PostgreSQL test removes the schema, including when assertions fail. No additional NuGet packages are required.
