# Database ERD (PostgreSQL)

```mermaid
erDiagram
    employees {
        uuid id PK
        string auth0_user_id UK
        string name
        string email
        string role
        string preferred_language
        bool is_active
        datetime created_at
    }

    drivers {
        uuid employee_id PK,FK
        string phone
        string license_number
        string status
        bytes RowVersion
    }

    trucks {
        uuid id PK
        string plate_number UK
        string model
        float capacity
        string status
        bool is_active
        datetime created_at
        bytes RowVersion
    }

    shipments {
        uuid id PK
        string tracking_id UK
        string status
        string cargo_description
        float cargo_weight
        float cargo_volume
        string origin_address
        string origin_city
        string origin_country
        string origin_postal_code
        float origin_lat
        float origin_lng
        string destination_address
        string destination_city
        string destination_country
        string destination_postal_code
        float destination_lat
        float destination_lng
        uuid driver_id FK
        uuid truck_id FK
        datetime created_at
        datetime updated_at
        datetime started_at
        datetime delivered_at
        datetime estimated_delivery_date
        bytes RowVersion
    }

    activities {
        uuid id PK
        uuid shipment_id FK
        uuid employee_id FK
        string type
        string description
        datetime timestamp
    }

    milestones {
        uuid id PK
        uuid shipment_id FK
        uuid created_by_employee_id FK
        string type
        string note
        string location_label
        float location_lat
        float location_lng
        datetime timestamp
    }

    documents {
        uuid id PK
        uuid shipment_id FK
        uuid uploaded_by_employee_id FK
        string type
        string url
        datetime uploaded_at
    }

    employees ||--o| drivers : "employee may be a driver"
    drivers ||--o{ shipments : "assigned driver"
    trucks ||--o{ shipments : "assigned truck"
    shipments ||--o{ activities : "timeline"
    employees ||--o{ activities : "actor"
    shipments ||--o{ milestones : "tracking events"
    employees ||--o{ milestones : "created by"
    shipments ||--o{ documents : "pod files"
    employees ||--o{ documents : "uploaded by"
```

## Notes
- `shipments.driver_id` and `shipments.truck_id` each have a partial unique index for active states (`Assigned`, `InTransit`) to prevent double allocation.
- `drivers.employee_id` is a shared key one-to-one with `employees.id`.
