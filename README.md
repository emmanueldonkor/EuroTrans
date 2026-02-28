# EuroTrans

EuroTrans is a full-stack logistics management platform built with **Next.js 16** (client) and **ASP.NET Core 8** (API), designed as a portfolio-grade project with clean architecture, vertical slices, Auth0-based authentication, and production CI/CD.

## Tech Stack
- Client: Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query
- Server: ASP.NET Core 8 (Minimal APIs), EF Core 8, PostgreSQL, FluentValidation
- Auth: Auth0 (JWT + RBAC permissions)
- Storage: Azure Blob Storage (Proof of Delivery files)
- Deployment: Vercel (client), Azure App Service (server), GitHub Actions

## Architecture
- `eurotrans.client`: UI, route handlers, dashboard/driver UX, API integration
- `eurotrans.server/src/EuroTrans.Api`: API host, endpoint mapping, middleware, health checks
- `eurotrans.server/src/EuroTrans.Application`: Use-cases/services, validators, contracts, abstractions
- `eurotrans.server/src/EuroTrans.Domain`: Business entities and domain rules
- `eurotrans.server/src/EuroTrans.Infrastructure`: EF Core, repositories, storage, external services
- `eurotrans.server/src/EuroTrans.Test`: Domain, application, infrastructure, and integration tests

## Core Features
- Shipment lifecycle: create, assign, start, in-transit updates, deliver, cancel
- Fleet and driver management with role-based access
- Live shipment tracking heartbeat with stale detection
- Proof-of-delivery upload and persistence
- Health endpoints: `/health/live` and `/health/ready`
- In-memory query caching with explicit version bumping

## Prerequisites
- Node.js `>=20.9.0`
- pnpm `>=10`
- .NET SDK 8.x
- PostgreSQL (local or cloud)
- Auth0 tenant and API/application setup

## Environment Setup
Create local env files from examples.

```powershell
Copy-Item eurotrans.client/.env.example eurotrans.client/.env.local
Copy-Item eurotrans.server/.env.example eurotrans.server/.env.local
```

Set real values for:
- Client: `AUTH0_*`, `APP_BASE_URL`, `EUROTRANS_API_BASE_URL`
- Server: `ConnectionStrings__Default`, `Auth0__Domain`, `Auth0__Audience`, `Cors__AllowedOrigins__0`, `AzureStorage__*`

## Run Locally
1. Start API (Terminal 1):
```powershell
cd eurotrans.server
dotnet restore EuroTrans.sln
dotnet run --project src/EuroTrans.Api/EuroTrans.Api.csproj
```

2. Start client (Terminal 2):
```powershell
cd eurotrans.client
pnpm install
pnpm dev
```

3. Open app:
- Client: `http://localhost:3000`
- API (Swagger in dev): `http://localhost:5002/swagger`

## Database Migrations
Apply migrations locally:

```powershell
dotnet tool install --global dotnet-ef
dotnet ef database update --project eurotrans.server/src/EuroTrans.Infrastructure/EuroTrans.Infrastructure.csproj --startup-project eurotrans.server/src/EuroTrans.Api/EuroTrans.Api.csproj
```

Add a migration:

```powershell
dotnet ef migrations add <MigrationName> --project eurotrans.server/src/EuroTrans.Infrastructure/EuroTrans.Infrastructure.csproj --startup-project eurotrans.server/src/EuroTrans.Api/EuroTrans.Api.csproj
```

## Testing
Run full server test suite:

```powershell
dotnet test eurotrans.server/EuroTrans.sln --configuration Release
```

Run only test project:

```powershell
dotnet test eurotrans.server/src/EuroTrans.Test/EuroTrans.Test.csproj
```

Run one class:

```powershell
dotnet test eurotrans.server/src/EuroTrans.Test/EuroTrans.Test.csproj --filter "FullyQualifiedName~EmployeeDomainTests"
```

## CI/CD (Current Setup)
- Client pipeline: `.github/workflows/client-cd.yml`
- Server pipeline: `.github/workflows/server-cd.yml`

Required GitHub secrets include:
- Client: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Server: `PROD_DB_CONNECTION_STRING`, `AZUREAPPSERVICE_PUBLISHPROFILE_5EEA8F3C1C964300BE898AC8B6FEEA84`

Production environment variables must also be set in Vercel and Azure App Service from the same keys used in `.env.example` files.

## API Versioning
- Current version: `v1.0`
- Include query parameter where required, e.g. `?api-version=1.0`

## Troubleshooting
- `HTTP 500` on `/api/auth/me`: verify DB connectivity and applied migrations.
- `401` from protected routes: verify Auth0 audience/scope/permissions and token forwarding.
- `404 NOT_FOUND` on frontend deployment: verify Vercel project link and environment variables.
- CORS errors: verify `Cors__AllowedOrigins__*` values in server environment settings.

## Portfolio Notes
This project is designed to demonstrate:
- Clean Architecture + Vertical Slice implementation
- Real-world auth, storage, caching, logging, health checks, and CI/CD
- Test coverage across domain, application, infrastructure, and API integration boundaries
