# Deployment readiness assessment

Assessment date: 26 October 2026 (Africa/Johannesburg). Base revision: `a3d5d6c`.

Photo/portfolio feature follow-up verified on 27 October 2026. The result table includes that follow-up where applicable.

**Decision: hold public production deployment.** The administrator role issue and the four vulnerable frontend tooling dependencies have been fixed and verified. The remaining release configuration and hosting findings below still need attention. A successful local build does not validate the eventual hosting environment.

## Verification results

| Check | Result |
| --- | --- |
| Frontend unit tests (`npm.cmd test`) | 4 passed |
| Frontend lint (`npm.cmd run lint`) | Passed |
| Frontend production build (`npm.cmd run build`) | Passed; TypeScript and Vite |
| Backend Release build | Passed; 0 errors (2 existing migration naming warnings on clean rebuild) |
| Standalone backend regression checks | 68 passed, including image decoding/orientation/validation |
| PostgreSQL service/migration checks | 53 passed in a disposable schema |
| Real HTTP workflow checks | 363 passed after the photo/portfolio additions |
| Browser workflow against isolated published Production API | Post-login welcome follow-up: 188 passed; 0 runtime errors |
| Published API in Production mode | 6 smoke checks passed |
| Administrator role-revocation security check | Fixed and verified: old SuperAdmin token returns 401 after demotion; fresh Admin token returns 403 for admin management |
| Backend publish/package inspection | Passed; local/development settings excluded, signing key and database defaults empty |
| npm production dependency audit | 0 known vulnerabilities reported |
| npm full dependency audit | 0 known vulnerabilities after the dependency update; original 4 high findings resolved |
| NuGet direct/transitive dependency audit | No vulnerable packages reported |

The Production smoke checks exercised `/health/live`, `/health/ready`, HTTP-to-HTTPS redirection, unauthenticated API rejection, and both Swagger endpoints being unavailable. They used the actual published package, a temporary local listener, explicit Production configuration, and read-only health requests to the configured database.

Database workflow tests create and remove randomly named `integration_*` schemas. Existing application tables are not their test fixtures. HTTP checks cover registration, company approval, role/account isolation, invalid requests, expired tokens, inactive accounts, job/quote transitions, worker assignment, concurrent updates, and simulated payment review. Payment success here does not mean money was transferred.

After correcting stale signup expectations, the initial 90-check browser run completed on 26 October. The expanded photo/portfolio browser run completed on 27 October against a separately published Production API and fresh disposable schema. It exercised the existing pages and new profile/business information flows at desktop/mobile widths, checked heading contrast and horizontal overflow, and verified customer/company/admin workflows through the real API. The API and test schema were cleaned up. New desktop/mobile profile and business information screenshots were visually inspected.

## Resolved security finding: administrator role changes

The initial assessment reproduced a role-change vulnerability: a SuperAdmin could be demoted to active Admin but continue calling `GET /api/Admin` with their old token, receiving HTTP 200. A fresh Admin token correctly received 403. Original evidence is retained in `.artifacts/deployment-readiness-role-revocation.json`.

The follow-up fix in `Build&Hire.API/Build&Hire.API/Program.cs` compares each administrator token's role with the current saved `AdminRole`, alongside the existing active-account check. Tokens with mismatched roles now fail authentication with HTTP 401. The frontend's existing 401 handler clears the session; a fresh login obtains the saved role. This applies to both promotion and demotion. A profile edit that preserves the role does not force sign-in again. No schema migration is required.

The original scenario was rerun against a newly published Production package in a separate disposable schema: after demotion, the old SuperAdmin token received **401**, while a fresh Admin token received **403** from `GET /api/Admin`. Saved demotion was confirmed and the schema was removed. Evidence: `.artifacts/admin-role-fix-production.json` and `.artifacts/admin-role-fix-production.log`.

The HTTP regression tests now check demotion, promotion, unchanged-role profile edits, and administrator deactivation. This fix enforces the current saved role; it does not introduce permanent token/session versioning or password-change revocation.

The follow-up Release build passed with zero warnings/errors. All **401 backend checks** passed: 59 standalone regressions, 53 PostgreSQL checks, and 289 HTTP workflow assertions. The temporary integration schema was removed. Output is saved in `.artifacts/admin-role-fix-tests.log`. Restart or redeploy the API with the rebuilt binaries to apply the fix; no running public service was changed during this work.

## Resolved dependency findings

Updated the affected development/build dependencies using compatible npm security fixes, and raised the direct Vite requirement in `BuildAndHireFrontend/package.json` to `^8.3.5`. `package-lock.json` records the updated dependency tree and associated Vite/Rolldown/PostCSS dependencies. No forced major-version upgrade or dependency override was used.

| Package | Before | After |
| --- | --- | --- |
| `brace-expansion` | 5.0.9 | 5.0.12 |
| `source-map-js` | 1.2.1 | 1.2.2 |
| `vite` | 8.2.2 | 8.3.5 |
| `zod` | 4.4.3 | 4.6.7 |

After the update, all 4 frontend tests, ESLint, and the TypeScript/Vite production build passed. A fresh full `npm audit --json` reports **zero known vulnerabilities**, including development dependencies. Evidence: `.artifacts/dependency-fix-audit.json`. The 90-check browser run above belongs to the initial assessment and was not rerun for this tooling update.

## Profile photo and completed-work additions — 27 October 2026

Added profile photo upload/replacement/removal for Customer, Company, Admin and SuperAdmin accounts, available from the sidebar account control. Companies can publish, edit and remove posts about past projects or their own completed platform jobs on business information pages. Other pages do not display these posts, and visitors have no publishing controls. Uploads are validated, resized, oriented and re-encoded as JPEG with metadata removed. Images live in PostgreSQL. See `INTEGRATION.md` for the API contracts and limits.

The additive `20261027062725_ProfilePhotosAndCompletedWork` migration was tested in disposable schemas and then applied successfully to the configured development database. It adds nullable account photo fields and a completed-work table without modifying existing account/job data. Rollback refuses to discard saved photos/posts. No public deployment was performed.

Validation passed: **484 backend checks** (68 standalone, 53 PostgreSQL, 363 HTTP), **116 real-browser checks**, 4 frontend tests, lint, and frontend/backend Release builds. The HTTP tests cover all account types, owner isolation, non-company rejection, invalid/incomplete/unrelated job links, photo removal, post editing/removal, inactive-company visibility, and rollback protection. Fresh npm and NuGet audits report no known vulnerabilities, including the new SkiaSharp image-processing dependencies. Evidence is saved under `.artifacts/profile-portfolio-*` and `.artifacts/browser-integration/report.json`.

## Split-flap post-login welcome — 27 October 2026

Added the official React Bits `SplitFlapText-TS-CSS` source, with the required type-only import adjustment, scoped application styling, and preserved upstream license. The registry lists no extra dependencies. The license is also copied into the published static site's `licenses/react-bits.txt`.

After a successful login or automatic customer signup login, the authenticated `/welcome` page animates “Build and Hire” using the existing brown/cream/terracotta palette. The complete 14-character phrase fits desktop and mobile widths. The page continues after 3.4 seconds to the account's existing dashboard; Continue and Escape skip it. Reduced-motion users see static text and continue after 600 ms. The welcome entry is replaced in browser history, and keyboard focus moves to dashboard content. Failed or anonymous sign-ins never show the welcome page.

The frontend build, lint and existing 4 unit tests passed. **188 real-browser assertions passed**, including customer/company/Admin/SuperAdmin routing, animation settling, brand colors, mobile overflow, keyboard focus/skip, automatic navigation, reduced motion, and the existing full application workflow. No browser runtime errors were reported. Desktop/mobile welcome screenshots were visually inspected. Evidence: `.artifacts/split-flap-browser.log` and `.artifacts/browser-integration/report.json`. No backend or database changes were required for this addition.

## Remaining findings to resolve before public launch

### 1. The default frontend release calls localhost

`BuildAndHireFrontend/src/utils/api.ts:1` falls back to `https://localhost:7172`. The production bundle generated by the normal build contains that address. The tracked `.env.development` only configures development; it does not supply the deployed API address for a production build.

Supply `VITE_API_BASE_URL` with the real HTTPS API origin **when building** the frontend. Check the resulting browser network requests against the deployed API, and configure the API's exact frontend CORS origin. A runtime setting added after static assets are built will not change this bundle.

### 2. Hosting acceptance remains unverified

`DEPLOYMENT.md` records that hosting, domain, production database, secrets, monitoring, and backups have not been provisioned through this repository's release procedure. The current backend workflow verifies the API but does not deploy it; there is no frontend verification workflow under `.github/workflows`.

On the selected host, verify HTTPS/DNS, trusted proxy handling, production CORS and hostnames, database migrations, secret rotation, log/error collection, backups and a restore test. Configure SPA fallback to `index.html` and test direct navigation/reload of routes such as `/signup`, `/my-jobs`, and `/company/jobs`. Run the complete browser workflow against staging with its actual API URL. The local test proxy redirects API calls, so its success alone would not prove the production API origin or cross-origin deployment works.

### 3. Payments are a demo feature

The application deliberately records simulated EFT outcomes. Its card modal also simulates processing. If the intended launch takes real payments, payment-provider integration and provider-confirmed payment state are required. If this is a demo deployment, preserve the existing simulation disclosures.

### 4. Minor release polish and protection gaps

- `BuildAndHireFrontend/index.html:5` points the favicon to `BuildAndHireFrontend\public\...`; that path does not exist in `dist`. Use the public asset's deployed root path. The referenced JS and CSS assets do exist.
- The document title remains `buildandhirefrontend` (`index.html:12`).
- No application login throttling or lockout was found in the login controller/startup code. Configure and verify login abuse protection in the application or hosting layer; the eventual hosting layer was not tested.

## Changes made during assessment

The browser signup helper expected `Your account is registered.` for both account types. Companies now navigate to `/signup/company-pending` and display `Your company account is registered.`; customers are automatically signed in and sent to `/home`. Updated the helper and customer signup assertion in `BuildAndHireFrontend/scripts/browser-integration.mjs` to verify those actual success outcomes, including the customer's session token. The two superseded browser timeouts were stale assertions; their captured pages showed successful signup. The corrected workflow then passed all 90 checks. The script also passes `node --check`, and `git diff --check` passes.

The follow-up administrator role fix changes authentication behavior and adds HTTP regression coverage. The subsequent dependency update changes the Vite requirement and frontend lockfile as detailed above. No website was deployed.

## Evidence and limits

- `.artifacts/deployment-readiness-tests.log`: passing database/backend checks and the superseded customer-signup assertion failure.
- `.artifacts/deployment-readiness-first-run.log`: initial run, including the stale browser expectation.
- `.artifacts/browser-integration/report.json`: current passing 188-check browser report and screenshot inventory; PNGs are in the same directory.
- `.artifacts/deployment-readiness-browser.log`: final browser harness exit/cleanup output (the child browser's results are in `report.json`).
- `.artifacts/deployment-readiness-production-smoke.json`: six published Production checks.
- `.artifacts/deployment-readiness-package.json`: inspected publish directory.
- `.artifacts/deployment-readiness-npm-production-audit.json`, `.artifacts/deployment-readiness-npm-audit.json`, `.artifacts/deployment-readiness-dotnet-audit.json`: dependency scan results.
- `.artifacts/dependency-fix-audit.json`: full npm audit after the dependency fixes, with zero known vulnerabilities.
- `.artifacts/profile-portfolio-backend.log`, `.artifacts/profile-portfolio-browser.log`, `.artifacts/profile-portfolio-migration.log`: current feature tests and development migration results.
- `.artifacts/profile-portfolio-npm-audit.json`, `.artifacts/profile-portfolio-dotnet-audit.json`: dependency scans after the feature additions.
- `.artifacts/split-flap-browser.log`: post-login welcome and full application browser checks, including all account types and reduced-motion behavior.

Artifacts are local and ignored by Git. Dependency scans reflect the advisory feeds queried during this assessment; passing scans do not establish that all security issues are absent. This assessment did not include a load/stress test, full accessibility audit, penetration test, or checks against a publicly deployed host.
