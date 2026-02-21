# EuroTrans Production Checklist (Next.js 16 + .NET 8)

## 1) Environment Variables

Set these in hosting platforms (do not commit real values):

- Client (`eurotrans.client/.env.example`)
- Server (`eurotrans.server/.env.example`)

## 2) Database Migration (PostgreSQL)

From repo root:

```bash
dotnet dotnet-ef migrations bundle \
  --project eurotrans.server/src/EuroTrans.Infrastructure \
  --startup-project eurotrans.server/src/EuroTrans.Api \
  --output eurotrans.server/src/EuroTrans.Api/migrate.exe
```

Run bundle in deployment with production connection string set:

```bash
./migrate.exe
```

## 3) Deploy Order

1. Deploy API (`EuroTrans.Api`) with production env vars.
2. Run migration bundle once per release.
3. Deploy Next.js app with `EUROTRANS_API_BASE_URL` set to API URL.
4. Validate Auth0 callback/logout URLs for production domain.

## 4) GitHub Actions Secrets

Server workflow (`.github/workflows/server-cd.yml`):

- `AZURE_WEBAPP_NAME`
- `AZURE_WEBAPP_PUBLISH_PROFILE`

Client workflow (`.github/workflows/client-cd.yml`):

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 5) Smoke Tests

- Login/logout works.
- `/api/backend/*` proxy can access API without 401 loops.
- Manager and driver dashboards load.
- Shipment create/assign/start/deliver flow works.
- File upload to Blob storage works.
