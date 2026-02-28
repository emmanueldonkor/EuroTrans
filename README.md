# EuroTrans

EuroTrans is a full-stack logistics platform for managing shipments, drivers, fleet operations, and live tracking.

It is built as a portfolio-quality project to demonstrate production-minded engineering with:
- Clean Architecture + Vertical Slice backend design
- Role-based auth (Auth0 + RBAC permissions)
- Operational concerns (health checks, rate limiting, structured logging, caching)
- CI/CD to Vercel (client) and Azure App Service (server)

## What This Project Demonstrates
- End-to-end product flow: manager operations + driver workflow
- Real API design with versioning, validation, and error handling
- Domain-driven business rules in the core model
- Practical testing across domain, application, infrastructure, and integration layers

## Tech Stack
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query
- Backend: ASP.NET Core 8 (Minimal APIs), EF Core 8, PostgreSQL
- Auth: Auth0 (`@auth0/nextjs-auth0` + JWT on API)
- Storage: Azure Blob Storage (proof of delivery)
- CI/CD: GitHub Actions

## Repository Structure
- `eurotrans.client`: Next.js application
- `eurotrans.server/src/EuroTrans.Api`: HTTP API host, middleware, endpoint mapping
- `eurotrans.server/src/EuroTrans.Application`: use cases, validators, abstractions
- `eurotrans.server/src/EuroTrans.Domain`: business entities and rules
- `eurotrans.server/src/EuroTrans.Infrastructure`: EF Core, repositories, external integrations
- `eurotrans.server/src/EuroTrans.Test`: backend tests

## Core Capabilities
- Shipment lifecycle: create, assign, start, milestone updates, deliver, cancel
- Driver and truck management
- Live shipment map with heartbeat updates and stale detection
- Proof-of-delivery file upload
- API versioning (`v1.0`), rate limiting, health endpoints, and global error handling

## Prerequisites
- Node.js `>= 20.9.0`
- pnpm `>= 10`
- .NET SDK 8.x
- PostgreSQL
- Auth0 tenant (API + app configured)
- Azure Blob Storage account/container

## Local Setup
1. Copy environment examples.

```powershell
Copy-Item eurotrans.client/.env.example eurotrans.client/.env.local
Copy-Item eurotrans.server/.env.example eurotrans.server/.env.local
```

2. Fill in real values in:
- `eurotrans.client/.env.local`
- `eurotrans.server/.env.local` (or user-secrets / host env)

3. Run database migrations.

```powershell
dotnet tool install --global dotnet-ef
dotnet ef database update --project eurotrans.server/src/EuroTrans.Infrastructure/EuroTrans.Infrastructure.csproj --startup-project eurotrans.server/src/EuroTrans.Api/EuroTrans.Api.csproj
```

4. Start backend.

```powershell
cd eurotrans.server
dotnet restore EuroTrans.sln
dotnet run --project src/EuroTrans.Api/EuroTrans.Api.csproj
```

5. Start frontend.

```powershell
cd eurotrans.client
pnpm install
pnpm dev
```

6. Open:
- Client: `http://localhost:3000`
- API Swagger (dev): `http://localhost:5002/swagger`

## Environment Variables
Use the provided examples as the source of truth:
- `eurotrans.client/.env.example`
- `eurotrans.server/.env.example`

Key groups:
- Client/Auth0: `AUTH0_*`, `APP_BASE_URL`
- Client -> API proxy: `EUROTRANS_API_BASE_URL`
- Server DB: `ConnectionStrings__Default`
- Server Auth0: `Auth0__Domain`, `Auth0__Audience`
- Server CORS: `Cors__AllowedOrigins__*`
- Server Storage: `AzureStorage__ConnectionString`, `AzureStorage__Container`

## Testing
Run all backend tests:

```powershell
dotnet test eurotrans.server/EuroTrans.sln --configuration Release
```

Run test project only:

```powershell
dotnet test eurotrans.server/src/EuroTrans.Test/EuroTrans.Test.csproj
```

## CI/CD
- Client deployment workflow: `.github/workflows/client-cd.yml`
- Server deployment workflow: `.github/workflows/server-cd.yml`

Required GitHub secrets:
- Client: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Server: `PROD_DB_CONNECTION_STRING`, `AZUREAPPSERVICE_PUBLISHPROFILE_5EEA8F3C1C964300BE898AC8B6FEEA84`

## API Notes
- Current API version: `1.0`
- Version reader supports:
- Query string: `?api-version=1.0`
- Header: `x-api-version: 1.0`

## Operational Endpoints
- Liveness: `/health/live`
- Readiness: `/health/ready`

## Troubleshooting
- `401` on protected routes: verify Auth0 audience/scope/permissions and token forwarding from Next.js proxy.
- `500` on `/api/auth/me`: usually DB connectivity/migration or app setting mismatch.
- CORS issues: verify `Cors__AllowedOrigins__*` in server environment.
- Frontend deploy `404 NOT_FOUND`: verify Vercel project link + production env values.
- Auth0 logout `invalid_request` (`returnTo URL is malformed`): trim spaces/newlines in `APP_BASE_URL` and ensure the exact URL is listed in Auth0 **Allowed Logout URLs**.

## Current Tradeoffs
- Query cache uses in-memory implementation (`MemoryQueryCache`), so it is not shared across multiple API instances.
- Frontend analytics is computed client-side from fetched data (good for MVP, not ideal at larger scale).

## Next Improvements
- Distributed cache (Redis) for multi-instance consistency
- Dedicated backend analytics endpoint
- Frontend automated test suite (unit + integration)
- CI branch protection with required quality gates

---

If you are evaluating this project for hiring, start with:
- `eurotrans.server/src/EuroTrans.Api/Program.cs`
- `eurotrans.server/src/EuroTrans.Application`
- `eurotrans.server/src/EuroTrans.Test`
