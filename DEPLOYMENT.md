# Backend release preparation

This prepares the .NET 10 API and PostgreSQL database for a hosting provider chosen later. It does not publish the application. Payments remain simulated. Frontend updates and browser acceptance testing are deferred.

## Build and verify

From the repository root, using PowerShell:

```powershell
./scripts/prepare-release.ps1 -PostgresConfig './Build&Hire.API/Build&Hire.API/appsettings.json'
```

The script builds Release, runs regression checks and the HTTP/PostgreSQL workflow in a disposable database schema, then publishes a framework-dependent package under a unique `.artifacts/api-*` directory. It verifies that local settings, development settings and environment files are absent and that published defaults contain no signing key or database credentials. The test database user needs permission to create/drop its test schema. Use a dedicated test database for CI/staging checks.

For configuration supplied entirely through environment variables, use `-PostgresEnvironment` and set `ConnectionStrings__DefaultConnection`. Running without either PostgreSQL option runs only standalone checks and is insufficient for release acceptance.

`.github/workflows/backend.yml` runs the same script on backend pull requests/pushes and manual dispatch, using a disposable PostgreSQL 16 service. It has read-only repository permissions and no deployment credentials. The workflow must be committed/pushed to execute on GitHub; its commands have been verified locally, but the GitHub runner has not been exercised yet. Action configuration follows the official [checkout](https://github.com/actions/checkout) and [setup-dotnet](https://github.com/actions/setup-dotnet) documentation.

## Runtime configuration

Use the host's secret/environment configuration rather than editing the release package. Double underscores represent nested configuration keys.

| Setting | Required value |
| --- | --- |
| `DOTNET_ENVIRONMENT` | `Production` (keep `ASPNETCORE_ENVIRONMENT` consistent if also set) |
| `ConnectionStrings__DefaultConnection` | Production PostgreSQL connection; database TLS/CA settings depend on the selected host |
| `JwtConfig__Key` | A fresh randomly generated secret of at least 64 UTF-8 bytes |
| `JwtConfig__Issuer` / `JwtConfig__Audience` | Stable identifiers agreed for this deployment |
| `JwtConfig__TokenValidityMins` | 1–1440; default 60 |
| `Cors__AllowedOrigins__0`, `__1`, etc. | Exact HTTPS frontend origins, without paths/trailing slashes |
| `AllowedHosts` | Intended API hostnames, separated by semicolons; align private probe hostnames with the host's probe setup |
| `ASPNETCORE_URLS` | Listener address/port chosen by the host |
| `Proxy__KnownProxies__0`, `__1`, etc. | Trusted reverse proxy IPs if TLS terminates upstream |
| `BootstrapAdmin__Enabled` | Normally `false`; enable only for first-administrator setup |

Startup refuses missing database settings, weak signing keys, invalid token lifetime, invalid proxy IPs, and missing/invalid production CORS origins. CORS permits browser access; API account authorization still applies separately.

Existing developer credentials were preserved in ignored `Build&Hire.API/Build&Hire.API/appsettings.Local.json`. This file is loaded only in Development, with environment variables/command-line settings taking precedence. It is excluded from build and publish output. On a fresh checkout create that file with your local `ConnectionStrings` and `JwtConfig`, or supply environment variables. The former credentials may remain in repository history: use new database credentials and a new signing key for production.

## HTTPS, proxy and monitoring

Configure the selected host to serve public HTTPS. A trusted reverse proxy must overwrite forwarded headers and send `X-Forwarded-Proto`; the API processes forwarded headers before HTTPS redirection. Loopback proxies are trusted by the framework default; configure other individual proxy IPs explicitly. Restrict the API's private HTTP listener to the proxy/monitoring network. If using Kestrel HTTPS directly, configure its certificate through host settings. These settings need a staging check once the network topology is known.

`GET /health/live` returns 200 when the API can respond. `GET /health/ready` checks database connectivity and pending migrations, returning 200 or 503. Both are anonymous and bypass HTTPS redirection for private HTTP probes. Responses contain only health status. Readiness does not prove backup health, database permissions for every write, or external infrastructure availability.

Production logs use JSON console output. Request logs include method, path, duration, status and trace ID, without request bodies, query strings, authorization headers or tokens. The host must collect logs and configure retention. Application exceptions are logged on the server and generic API failures expose a trace ID for correlation. Swagger is enabled only in Development.

## Release procedure once hosting is chosen

1. Provision staging, PostgreSQL and runtime settings. A framework-dependent package needs the .NET 10 ASP.NET Core runtime. Configure DNS/TLS, trusted proxy addresses, CORS and process supervision using the host's facilities.
2. Before changing an existing database, take a consistent backup including migration history. PostgreSQL tools such as `pg_dump`/`pg_restore` should match the database version. Restore the backup into a separate database and verify it. Agree backup retention and recovery targets before production.
3. Stop/drain API writers for migrations. From the package directory, with the destination database configured, run `dotnet BuildAndHire.API.dll --migrate`. Normal startup never migrates automatically. Run migrations with a database identity allowed to alter the schema; use an appropriately restricted identity for the running API.
4. Start staging with `dotnet BuildAndHire.API.dll`. Bootstrap the first SuperAdmin using the environment settings in [INTEGRATION.md](INTEGRATION.md), then remove bootstrap credentials and disable bootstrap.
5. Check liveness/readiness, HTTPS, CORS, logs and a fresh full backend workflow against a dedicated staging test database. Verify the actual deployed API's signup → approval → job → quote acceptance → worker assignment → simulated payment/review sequence and account isolation. Browser verification follows the frontend update.
6. Repeat the verified procedure for production, then monitor health and errors. Record the released revision, migration IDs and backup reference.

Do not promise a schema rollback as the default recovery strategy. Current migrations deliberately refuse rollback when it would lose workforce/lifecycle data. Use a forward fix where possible. A database restore requires stopping writes and an explicit decision about losing changes since the backup; reverting binaries alone may be incompatible with the new job/quote contract.

The hosting provider, account, region, domain, production database, secret storage, log collection and backup service remain undecided. No infrastructure or live deployment has been created.
