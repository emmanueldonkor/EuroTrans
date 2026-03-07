# Backend Clean Architecture (Vertical Slice)

```mermaid
flowchart TD
    API[Minimal API Endpoints\nEuroTrans.Api/Endpoints] --> APP[Application Services\nEuroTrans.Application/features/*]
    APP --> DOMAIN[Domain Entities + Value Objects\nEuroTrans.Domain]
    APP --> PORTS[Interfaces\nRepositories / External Services]

    PORTS --> INFRA[Infrastructure Implementations\nEuroTrans.Infrastructure]
    INFRA --> DB[(PostgreSQL)]
    INFRA --> BLOB[(Azure Blob Storage)]

    API --> MW[Cross-Cutting Middleware\nException Handling / Logging / Auth / Rate Limit]
    MW --> APP
```

## Why this structure matters
- Endpoints stay thin and orchestrate use cases.
- Business logic lives in services/domain model, not repository/query plumbing.
- Infrastructure can be swapped without changing business rules.
