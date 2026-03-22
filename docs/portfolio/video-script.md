# EuroTrans Walkthrough Script (10–12 minutes)

## 0:00–0:20 Hook
"Hey everyone, I’m Emmanuel. This is EuroTrans — a full‑stack fleet and shipment management platform with role‑based dashboards, live tracking, and analytics. I’ll demo the product first, then walk through the architecture and key technical decisions."

## 0:20–2:30 Product Demo (Manager)
- Login as Manager
"Here’s the manager dashboard. You can see shipments, fleet, employees, documents, analytics, and a live map."

### Shipments (manager)
"Shipments are searchable and filterable, with clean status badges and pagination. You can create, assign, start, and deliver shipments."

### Live Map
"The live map shows in‑transit shipments with last‑known location and a staleness indicator."

### Analytics
"Analytics summarizes total, active, delivered shipments, and driver workload distribution."

### Fleet + Employees + Documents
"Fleet shows trucks with status. Employees shows driver status and profile completeness. Documents shows proof‑of‑delivery files."

## 2:30–3:40 Product Demo (Driver)
"Now the driver experience. Drivers only see their own shipments and actions."

### Driver Home
"Driver home shows current job and quick actions."

### Driver Shipments
"Drivers see assigned shipments, status, and route details."

### Deliver Flow
"Delivering prompts for proof‑of‑delivery upload and records the delivery timestamp."

## 3:40–6:00 Backend Architecture
"Backend is .NET 8 with Clean Architecture + Vertical Slice."
- Domain: core entities and rules
- Application: use‑cases and validators
- Infrastructure: database, storage, external integrations
- API: endpoints and middleware

"Each feature lives in its own slice, which keeps logic close to the use case and avoids bloated controllers."

## 6:00–7:30 Auth & Security
"Auth is handled with Auth0. We use role‑based access control to separate manager and driver dashboards."
"Requests validate user context and avoid cross‑tenant access."

## 7:30–8:40 Data & Performance
"Data is stored in Postgres. We use pagination and server‑side filtering to keep queries fast."
"Client uses React Query for caching and smooth loading states."

## 8:40–9:40 Live Tracking Model
"Without hardware, the app simulates live tracking using heartbeat updates from the driver screen."
"This keeps the live map updated without adding external IoT complexity."

## 9:40–10:30 Testing & Reliability
"We added unit and integration tests for core flows and endpoints."
"Health checks and logging are included to make production debugging easier."

## 10:30–11:30 Wrap‑Up
"That’s EuroTrans. The repo is linked below with demo credentials and documentation."
"If you’re hiring or want feedback, feel free to reach out. Thanks for watching."

---

## On‑Screen Checklist (quick notes)
- Show Manager: Shipments → Live Map → Analytics → Fleet → Employees → Documents
- Show Driver: Home → Shipments → Deliver
- Mention: Clean Architecture, RBAC, caching, tracking heartbeat

## Demo Accounts (if you want to show on screen)
Manager: edonkor0001@gmail.com / Eurotrans1234@#
Driver: edonkor0000@gmail.com / Eurotrans1234@#
