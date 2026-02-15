# Frontend ↔ Backend Data Contract Analysis (Pre-Integration)

This document maps what the frontend currently **reads/writes** (based on mock API + UI usage) against what the backend currently **accepts/returns** (endpoints + application DTOs + domain model), so you can integrate with minimal data inconsistency.

## 1) High-risk incompatibilities to resolve first

1. **ID type mismatch (`string` vs `Guid`)**
   - Frontend types use string IDs for shipments/drivers/trucks/users.
   - Backend contracts use `Guid` for entity IDs.
   - Integration impact: assignment, filtering, and detail routes can fail or require explicit conversion.

2. **Status representation mismatch (string literals vs enum numbers/other values)**
   - Frontend expects shipment statuses like `"draft" | "unassigned" | "in-transit" | "delivered"`.
   - Backend domain supports `Draft, Unassigned, Assigned, InTransit, Delivered, Cancelled`.
   - Backend currently does not configure JSON enum string serialization globally, so enums can serialize as numbers by default.
   - Integration impact: status badges, filters, and state transitions can break silently.

3. **`GET /api/shipments` response shape mismatch**
   - Frontend expects `Shipment[]` with `cargo`, `origin`, `destination`, `updatedAt`, etc.
   - Backend returns paged envelope `{ items, totalCount, page, pageSize }`, and each item is summary-only (no route object, no `updatedAt` field).
   - Integration impact: shipment listing page currently reads `shipment.origin.city` and `shipment.updatedAt`.

4. **Create shipment payload mismatch**
   - Frontend mock sends `status`, and includes `origin/destination.lat/lng` inside location objects.
   - Backend `CreateShipmentRequest` accepts `{ cargo, origin, destination, estimatedDeliveryDate }` with address fields only (no status, no lat/lng).
   - Integration impact: frontend create form payload will not bind directly.

5. **Mutation response mismatch (frontend expects full entities, backend often returns `Ok()`/`NoContent`)**
   - Frontend mutation hooks expect shipment/truck objects returned after assign/start/deliver/update.
   - Backend assign/start/cancel/milestone endpoints return empty success responses; truck update/delete returns `NoContent`.
   - Integration impact: React Query cache invalidation currently relies on returned object IDs.

6. **Driver data mismatch (`phone` missing from backend response)**
   - Frontend employee table renders `driver.phone`.
   - Backend `GetDriversResponse` and `GetDriverResponse` do not include phone.
   - Integration impact: missing data column unless frontend changes or backend DTO expands.

7. **Delivery endpoint contract mismatch (multipart file vs URL string)**
   - Frontend mock `deliverShipment(id, proofOfDeliveryUrl: string)` sends URL string.
   - Backend deliver endpoint expects `IFormFile file` upload and builds proof URL server-side.
   - Integration impact: frontend upload flow must switch to `multipart/form-data` with file.

8. **Activity/milestone shape mismatch**
   - Frontend activity model expects `userId`, `userName`, freeform type includes `updated`/`deleted`.
   - Backend activities return `EmployeeId`, enum `ActivityType`, description, timestamp; no user name field.
   - Frontend milestone model expects `location` object and `type`; backend milestone DTO exposes lat/lng + note + timestamp and no type in request.

---

## 2) Frontend current data expectations (source of truth today)

## 2.1 Core frontend models

Current client-side types:
- `Shipment` includes nested `cargo`, `origin`, `destination`, optional `currentLocation`, optional `milestones`, lifecycle timestamps, and `proofOfDeliveryUrl`.
- `Driver` includes `phone`, `licenseNumber`, and status string (`available/on-duty/off-duty`).
- `Truck` includes `plateNumber`, `model`, `capacity`, status string (`available/in-use/maintenance`).
- `Activity` includes `userId`, `userName`, and string union activity type.

These types drive most rendering and mutations.

## 2.2 Frontend reads that matter for integration

- Shipment list page (`/dashboard/shipments`) uses:
  - `trackingId`, `status`, `driverId`, `origin.city`, `destination.city`, `updatedAt`.
- Shipment detail page uses:
  - `cargo.*`, `origin.*`, `destination.*`, `status`, `driverId`, `truckId`, `createdAt`, `startedAt`, `deliveredAt`, activities list.
- Driver pages use:
  - `name`, `email`, `phone`, `licenseNumber`, `status`.
- Fleet page uses truck fields and status mutation semantics.

## 2.3 Frontend writes that matter for integration

- Create shipment sends draft-like payload with full cargo + full route location objects.
- Assign shipment sends `{ driverId, truckId }`.
- Start shipment currently no request body (id in path conceptually).
- Deliver shipment currently sends proof URL string, not file.
- Add milestone uses note + location (mock uses richer milestone object).
- Truck create/update/delete expect object-shaped success responses in some places.

---

## 3) Backend current contracts and entity model

## 3.1 Shipment domain / DB model capabilities

Backend shipment entity + migration include:
- cargo description/weight/volume,
- origin/destination address fields,
- origin/destination coordinates,
- driver/truck assignment,
- created/updated/started/delivered timestamps,
- estimated delivery date,
- related activities/milestones/documents.

So the **database/domain can hold most of what frontend wants**, but the current API DTOs expose only a subset.

## 3.2 Shipment endpoint contracts (actual API behavior)

- `GET /api/shipments` → paginated `GetShipmentsResponse` with summary items.
- `GET /api/shipments/{id}` → detailed `GetShipmentResponse`, but currently no started/delivered/updated timestamps and no proof-of-delivery URL field in DTO.
- `POST /api/shipments` → accepts `CreateShipmentRequest` and returns `{ id }` location-created response.
- `POST /api/shipments/{id}/assign` → returns `Ok()`.
- `POST /api/shipments/{id}/start` → returns `Ok()`.
- `POST /api/shipments/{id}/deliver` → expects uploaded file, returns message + `proofUrl`.
- `POST /api/shipments/{id}/milestones` → returns `Ok()`.
- `GET /api/shipments/{id}/activities` → returns activity list with employee ID, enum type, description, timestamp.

## 3.3 Driver/truck endpoint contracts

- Drivers:
  - `GET /api/drivers`/`GET /api/drivers/{id}` return driver profile data from employee+driver, but **no phone field in response DTOs**.
- Trucks:
  - `GET /api/trucks` returns domain truck entities.
  - `POST /api/trucks` returns created ID only.
  - `PUT /api/trucks/{id}/status` and `DELETE /api/trucks/{id}` return no content.

---

## 4) Contract diff matrix (frontend expectation vs backend reality)

| Domain | Frontend expects | Backend currently returns/accepts | Integration risk |
|---|---|---|---|
| IDs | string IDs (`"1"`, `"d1"`) | Guid IDs | High |
| Shipment status | kebab-case string values | enum with extra states (`Assigned`, `Cancelled`) and likely numeric JSON | High |
| Shipments list | `Shipment[]` rich objects | paginated summary envelope | High |
| Shipment detail | includes lifecycle timestamps + route objects in frontend format | partial detail DTO (missing several frontend fields) | High |
| Create shipment | accepts `status`, location object with lat/lng | no status, address DTO names differ, no lat/lng in request | High |
| Deliver shipment | string proof URL | multipart file upload endpoint | High |
| Activity | `userName` + string type | `EmployeeId` + enum type, no name | Medium |
| Milestone | `location` object + `type` | lat/lng + note only request; DTO shape differs | Medium |
| Driver | includes phone | DTO excludes phone | Medium |
| Truck mutations | expect object result in client cache logic | no-content / created-id-only responses | Medium |

---

## 5) Recommended integration strategy (order matters)

## Phase 1 — Freeze a canonical API contract before wiring UI

Choose one canonical transport contract for frontend consumption (recommended: dedicated API DTOs, not raw domain entities), and define these explicitly:

1. **Enum strategy**
   - Decide whether API returns enum strings (recommended) and exact casing (`in-transit` vs `InTransit`).
   - Add explicit mapping layer for frontend-friendly status literals.

2. **ID strategy**
   - Keep backend GUIDs, but always serialize as string in JSON (natural for GUID).
   - Frontend should treat IDs as opaque strings (already close).

3. **Shipment list contract**
   - Either:
     - A) keep paginated backend response and update frontend hooks/pages accordingly, or
     - B) expose frontend-specific list DTO that includes route summary + updated timestamp.
   - Prefer A + frontend adaptation to avoid API anti-patterns.

4. **Create shipment contract**
   - Align request fields and names exactly.
   - If coordinates are required by backend domain, include them in API DTO (or derive server-side via geocoding).

5. **Mutation response contract**
   - Standardize either on:
     - `204 No Content` for commands + frontend refetch, or
     - returning updated resource snapshot.
   - Pick one style consistently per domain.

6. **Deliver proof contract**
   - Move frontend to file upload endpoint contract (`multipart/form-data`) and treat returned URL as output only.

## Phase 2 — Add explicit frontend↔backend adapters

Implement adapter functions (single mapping layer) so UI components continue using current rich types while API can evolve safely:
- `mapShipmentSummaryApiToUi`,
- `mapShipmentDetailApiToUi`,
- `mapDriverApiToUi`,
- reverse mappers for create/assign/milestone requests.

This isolates schema drift and reduces page-level rewrites.

## Phase 3 — Resolve missing fields intentionally

Decide per field whether it should be:
- exposed by backend now,
- computed client-side,
- or dropped from UI.

Key decisions needed immediately:
- include `phone` for drivers or remove phone column,
- include `updatedAt/startedAt/deliveredAt/proofOfDeliveryUrl` in shipment detail DTO,
- include route city summary in list DTO or load detail lazily.

---

## 6) Concrete pre-integration checklist

Use this checklist before replacing mock API calls:

- [ ] Agree final JSON values for `ShipmentStatus`, `DriverStatus`, `TruckStatus`, `ActivityType`.
- [ ] Decide pagination contract for shipment list and update `useShipments` accordingly.
- [ ] Align create-shipment request payload (field names + required/optional + coordinates).
- [ ] Align deliver-shipment flow to file upload.
- [ ] Align assign/start/cancel/milestone response handling (object vs no-content).
- [ ] Add driver phone to backend DTOs **or** remove frontend dependency.
- [ ] Define activity payload with/without actor display name.
- [ ] Add adapter layer in frontend before switching transport from mock to real API.
- [ ] Add contract tests (backend) + runtime schema validation (frontend) for core DTOs.

---

## 7) Suggested “minimum viable aligned contracts”

If you want fastest integration with least churn:

1. Keep backend endpoints mostly as-is.
2. Update frontend to support:
   - paginated shipments response,
   - GUID IDs,
   - enum mapping helpers,
   - no-content command responses.
3. Expand backend DTOs minimally for blockers:
   - add `phone` to driver responses,
   - add shipment timestamps + proof URL in detail response,
   - expose route city info in list items (or relax list UI).
4. Replace frontend deliver call with multipart upload.

This gives a stable “bridge” without reworking domain logic.
