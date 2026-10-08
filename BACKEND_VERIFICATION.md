# Backend integration verification

Verified on 8 October 2026 against the current working tree. Payments remain simulated; no payment provider or frontend changes were introduced.

## Results

- 33 existing regression checks passed.
- 30 existing PostgreSQL integration checks passed.
- 109 new HTTP workflow assertions passed against the actual API process, including authentication middleware and request validation.
- The generated test schema was removed after completion. Application tables were not used for fixtures.

The tested flow is company signup, administrator approval, company/customer login, customer job creation, company quote, worker creation and assignment, simulated EFT request, and administrator review. Successful payment status and amount paid are consistent when read by the customer, company, and administrator. Pending and failed payments do not count as paid.

Fresh PostgreSQL contexts verify saved ownership, quote, UTC dates, worker assignment/status, hashed signup passwords, and payment amount/status/reference.

Negative cases include duplicate signup/payment requests, invalid identifiers and enums, negative quotes, payment before quoting, quote changes after payment creation, attempts to change completed payment status, spoofed owner IDs, unrelated account reads/writes/deletes, and restricted role actions. Invalid/expired tokens and previously issued tokens for subsequently disabled accounts are rejected. Allowed and unconfigured CORS origins are checked.

## Findings and limits

- The tested backend workflow passes; this is not a claim that every endpoint or business rule is fully verified.
- Only one payment record is allowed per job. Even a failed simulated payment prevents another request for that job; retry/reset behavior needs a separate decision.
- Workers must be assigned to a job when created. The current update endpoint changes worker status, not job assignment; an unassigned workforce or reassignment flow would need separate work.
- Job states remain Working, Available, and Unavailable. Acceptance, completion, cancellation, and quote revision workflows were not added by this verification.
- HTTP checks run on an isolated loopback HTTP listener. Browser behavior, HTTPS certificate trust, deployment configuration, restart recovery, and simultaneous conflicting requests were not verified here.
- The older HTTPS smoke script was corrected to check authenticated `POST /api/Payment/eft` rather than the removed `POST /api/Payment` route. Its standalone HTTPS run remains separate; the new suite verifies overlapping middleware behavior over loopback HTTP.

## Repeat the checks

From the repository root, with PostgreSQL available and the configured database user allowed to create schemas:

```powershell
dotnet run --project './Build&Hire.API/BuildAndHire.RegressionTests/BuildAndHire.RegressionTests.csproj' --no-restore -- --postgres-config './Build&Hire.API/Build&Hire.API/appsettings.json'
```

The runner creates a random `integration_<GUID>` schema and applies migrations there. The child API receives only that schema's connection string plus test JWT settings through environment variables. Test credentials and tokens are not printed. The child process is stopped before the enclosing PostgreSQL test removes the schema, including when assertions fail. No additional NuGet packages are required.
