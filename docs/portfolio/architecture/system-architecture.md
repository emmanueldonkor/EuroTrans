# System Architecture

```mermaid
flowchart LR
    subgraph Clients
        M[Manager Browser]
        D[Driver Browser]
    end

    M --> FE
    D --> FE

    FE[Next.js 16 App on Vercel]
    FE --> Proxy[Next API Proxy\n/api/backend/*]
    Proxy --> API[ASP.NET Core 8 API\nEuroTrans.Api]

    API --> APP[Application Layer\nUse Cases + Validation]
    APP --> DOM[Domain Layer\nBusiness Rules]
    APP --> INF[Infrastructure Layer\nRepositories + Integrations]

    INF --> DB[(PostgreSQL)]
    INF --> BLOB[(Azure Blob Storage)]

    FE --> AUTH0[Auth0\nOIDC + Session]
    API --> AUTH0

    GHA[GitHub Actions] --> VercelDeploy[Vercel Deploy]
    GHA --> AzureDeploy[Azure App Service Deploy]
    VercelDeploy --> FE
    AzureDeploy --> API
```

## Notes
- Frontend calls backend through the Next.js proxy route (`/api/backend/*`).
- API uses JWT validation + RBAC policies.
- Domain and business invariants are enforced in application/domain layers, not controllers.
