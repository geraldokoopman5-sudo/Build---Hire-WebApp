<div align="center">

# Build & Hire

### From the first request to the final project update.

A full-stack construction project platform connecting customers with companies, with dedicated workspaces for project management, workforce coordination, and platform administration.

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript 6](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![ASP.NET Core 10](https://img.shields.io/badge/ASP.NET_Core-10-512BD4?logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

[Features](#features) · [Architecture](#architecture) · [Getting started](#getting-started) · [Verification](#verification) · [Documentation](#documentation)

</div>

## Overview

Build & Hire brings the customer and company sides of a construction project into one application. Customers can discover approved company accounts, submit project requests, review quotes, and follow progress. Companies can manage incoming requests, coordinate workers, and showcase completed work. Administrators oversee company approvals, account management, and simulated payment reviews.

The frontend uses React and TypeScript, backed by an ASP.NET Core REST API and PostgreSQL. Separate customer, company, administrator, and super administrator workspaces keep each role focused on its own responsibilities.

> **Payment demo:** Payments are simulated. The application records EFT requests and administrator review outcomes; it does not transfer money or connect to a live payment gateway.

## Features

| Workspace | Capabilities |
| --- | --- |
| **Customer** | Browse and search approved companies, view business profiles and completed work, create project requests, accept quotes, track job progress, and submit simulated EFT payment requests. |
| **Company** | Register for approval, accept or reject requests, send quotes, start and complete jobs, manage a workforce, and publish completed-work posts with photos. |
| **Administrator** | Review company registrations, manage customer and company accounts, and approve or decline pending simulated payments. |
| **Super administrator** | Access platform oversight and create, update, deactivate, restore, or delete administrator accounts. |

Additional capabilities include:

- **Workforce assignment:** Create workers independently of jobs, then assign, reassign, or unassign them from accepted projects.
- **Project lifecycle controls:** Explicit actions for acceptance, rejection, starting, completion, and cancellation, with customer quote agreement before work starts.
- **Business portfolios:** Company information and completed-work posts with descriptions, completion dates, locations, and photos.
- **Account profiles:** Profile editing and photo uploads, with server-side image processing.
- **Role and ownership checks:** JWT authentication, protected frontend routes, and API authorization for account-specific records.
- **Responsive interface:** Shared workspace components, confirmation dialogs, loading and error states, and an animated post-login welcome with reduced-motion support.

### Typical project journey

1. A company registers and an administrator approves its account.
2. A customer chooses a company and submits a project request.
3. The company accepts the request and sends a quote.
4. The customer reviews and accepts the quoted amount.
5. The company assigns workers, starts the job, and tracks it through completion.
6. The customer can submit a simulated EFT request against the accepted quote, and an administrator records the review outcome.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7 |
| Styling | CSS Modules, shared CSS theme, React Bits SplitFlapText |
| API | C#, ASP.NET Core 10, REST controllers |
| Data | PostgreSQL, Entity Framework Core 10, Npgsql |
| Authentication and validation | JWT bearer tokens, BCrypt password hashing, FluentValidation |
| Image processing | SkiaSharp |
| Quality and release tooling | ESLint, Node.js test runner, custom .NET regression runner, GitHub Actions, Docker |

## Architecture

The backend separates HTTP endpoints, application services, domain models, and persistence into dedicated projects.

```text
React + TypeScript frontend
            |
       HTTPS / JSON
            |
     ASP.NET Core API
            |
    Application services
            |
 Infrastructure repositories
            |
        PostgreSQL

Domain models, enums, and scheduling rules support the backend layers.
```

```text
Build---Hire-WebApp/
|-- BuildAndHireFrontend/             # React application
|   |-- src/components/              # Shared UI and workspace components
|   |-- src/pages/                   # Customer, company, and admin screens
|   |-- src/context/                 # Shared application state
|   |-- src/hooks/                   # Session, API, and calendar hooks
|   |-- src/types/                   # TypeScript contracts
|   |-- src/utils/                   # API client and workflow helpers
|   |-- tests/                       # Frontend calendar checks
|   `-- scripts/                     # Browser integration harness
|-- Build&Hire.API/
|   |-- Build&Hire.API/              # Controllers, middleware, and startup
|   |-- BuildAndHire.Application/    # Services, DTOs, interfaces, validators
|   |-- BuildAndHire.Domain/         # Models, enums, value objects, scheduling
|   |-- BuildAndHire.Infrastructure/ # EF Core, migrations, repositories, auth
|   |-- BuildAndHire.RegressionTests/# Regression and integration checks
|   `-- Dockerfile                  # API container build
|-- .github/workflows/               # Backend verification workflow
`-- scripts/                        # Release preparation
```

## Getting started

### Prerequisites

- .NET 10 SDK.
- Node.js 24 with npm.
- A running PostgreSQL instance. The backend CI workflow uses PostgreSQL 16.
- Git and PowerShell for the commands below.

### 1. Clone the repository

```powershell
git clone https://github.com/geraldokoopman5-sudo/Build---Hire-WebApp.git
Set-Location './Build---Hire-WebApp'
```

Run the following commands from the repository root unless stated otherwise.

### 2. Configure the API

Create a local PostgreSQL database, then create `Build&Hire.API/Build&Hire.API/appsettings.Local.json` with your own connection details:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=buildandhire;Username=YOUR_DATABASE_USER;Password=YOUR_DATABASE_PASSWORD"
  },
  "JwtConfig": {
    "Issuer": "BuildAndHire",
    "Audience": "BuildAndHireAPI",
    "Key": "REPLACE_WITH_YOUR_GENERATED_SIGNING_KEY",
    "TokenValidityMins": 60
  }
}
```

Replace every placeholder. The JWT signing key must contain at least **64 UTF-8 bytes**. Generate a random key with PowerShell and copy the result into `JwtConfig.Key`:

```powershell
$jwtBytes = New-Object byte[] 64
$jwtRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$jwtRng.GetBytes($jwtBytes)
[Convert]::ToBase64String($jwtBytes)
$jwtRng.Dispose()
```

The local settings file is Git-ignored, loaded only in Development, and excluded from build and publish output. Environment variables and command-line settings take precedence. For deployment configuration, see [DEPLOYMENT.md](DEPLOYMENT.md).

### 3. Prepare the database and local HTTPS

```powershell
dotnet dev-certs https --trust
dotnet run --project './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj' --launch-profile https -- --migrate
```

The migration command applies the existing EF Core migrations and exits. Normal API startup does not apply migrations automatically.

### 4. Create the first super administrator and start the API

In the terminal that will run the API:

```powershell
$env:BootstrapAdmin__Enabled = 'true'
$env:BootstrapAdmin__Email = Read-Host 'First SuperAdmin email'
$bootstrapPassword = Read-Host 'First SuperAdmin password (at least 12 characters)' -AsSecureString
$env:BootstrapAdmin__Password = [System.Net.NetworkCredential]::new('', $bootstrapPassword).Password

dotnet run --project './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj' --launch-profile https
```

Bootstrap creates the first super administrator if one does not already exist. After the first successful startup, stop the API with `Ctrl+C`, remove the bootstrap settings, and start normally:

```powershell
Remove-Item Env:BootstrapAdmin__Enabled, Env:BootstrapAdmin__Email, Env:BootstrapAdmin__Password
Remove-Variable bootstrapPassword
dotnet run --project './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj' --launch-profile https
```

### 5. Start the frontend

Open a second terminal at the repository root:

```powershell
npm --prefix './BuildAndHireFrontend' ci
npm --prefix './BuildAndHireFrontend' run dev
```

The committed development configuration sets `VITE_API_BASE_URL=https://localhost:7172`. If you change the API address, override it in `BuildAndHireFrontend/.env.development.local` and restart Vite. Allow the matching frontend origin in the API's `Cors:AllowedOrigins` configuration.

| Service | Local address |
| --- | --- |
| Web application | <http://localhost:5173> |
| HTTPS API | <https://localhost:7172> |
| Swagger UI, Development only | <https://localhost:7172/swagger> |
| Liveness check | <https://localhost:7172/health/live> |
| Database readiness check | <https://localhost:7172/health/ready> |

Sign in with the bootstrap administrator to manage the platform, or register a customer or company account through the signup page. Company accounts remain pending until approved by an administrator.

## Verification

Run the frontend checks and backend regression runner from the repository root:

```powershell
npm --prefix './BuildAndHireFrontend' test
npm --prefix './BuildAndHireFrontend' run lint
npm --prefix './BuildAndHireFrontend' run build

dotnet build './Build&Hire.API/Build&Hire.API/BuildAndHire.API.csproj'
dotnet run --project './Build&Hire.API/BuildAndHire.RegressionTests/BuildAndHire.RegressionTests.csproj'
```

The backend tests use a custom executable runner, invoked with `dotnet run`.

For PostgreSQL and real HTTP workflow checks, use a configured test database whose user can create and drop schemas:

```powershell
dotnet run --project './Build&Hire.API/BuildAndHire.RegressionTests/BuildAndHire.RegressionTests.csproj' -- --postgres-config './Build&Hire.API/Build&Hire.API/appsettings.json'
```

For the browser workflow, first build the frontend, then run:

```powershell
dotnet run --project './Build&Hire.API/BuildAndHire.RegressionTests/BuildAndHire.RegressionTests.csproj' -- --browser-config './Build&Hire.API/Build&Hire.API/appsettings.json'
```

The integration runner creates an isolated test schema and removes it afterward. The browser checks require Node.js and a Chromium browser; Windows defaults to Microsoft Edge. Set `BUILDANDHIRE_TEST_BROWSER` to select another Chromium executable. Reports and screenshots are written to `.artifacts/browser-integration`.

## Deployment

The repository includes an API Dockerfile, a PowerShell release preparation script, a backend GitHub Actions workflow, and a Vercel SPA rewrite configuration for the frontend.

Production setup requires PostgreSQL, a JWT signing key, exact HTTPS CORS origins, and host-specific HTTPS and proxy configuration. Set `VITE_API_BASE_URL` before building the frontend for its deployed API address. Swagger is enabled only in Development.

See [DEPLOYMENT.md](DEPLOYMENT.md) for release commands, runtime settings, health checks, migrations, and backup guidance, and [DEPLOYMENT_READINESS.md](DEPLOYMENT_READINESS.md) for the recorded readiness assessment.

## Documentation

| Guide | Contents |
| --- | --- |
| [Local integration](INTEGRATION.md) | API contracts, authentication, administrator setup and recovery, workforce behavior, and integration commands. |
| [Backend verification](BACKEND_VERIFICATION.md) | Recorded regression, PostgreSQL, HTTP, and browser verification coverage. |
| [Deployment](DEPLOYMENT.md) | Release preparation and production configuration. |
| [Deployment readiness](DEPLOYMENT_READINESS.md) | Deployment assessment and remaining infrastructure considerations. |
| [React Bits integration](REACT_BITS_INTEGRATION.md) | Welcome animation implementation, attribution, and UI integration notes. |

## Contributing

To report a bug or propose an improvement, [open an issue](https://github.com/geraldokoopman5-sudo/Build---Hire-WebApp/issues) with the affected workflow and steps to reproduce. For code changes, use a feature branch, run the relevant verification commands, and describe the behavior and validation in your pull request.

## Author and licensing

Created by [Geraldo Koopman](https://github.com/geraldokoopman5-sudo).

This repository does not currently include a project-wide license. Third-party components retain their own license notices, including the [React Bits SplitFlapText license](BuildAndHireFrontend/src/components/reactbits/SplitFlapText/LICENSE.md).
