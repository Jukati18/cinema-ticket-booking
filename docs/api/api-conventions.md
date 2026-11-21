# Backend – Frontend API Conventions

> Status: **draft v0.1**. To be reviewed by Phong (M2) and Chau Phat (M4) before being frozen at the end of Sprint 1.
> Author: Viet (M1). Inputs: `web-project-short.md` sections 2 and 3, meeting notes of 18/11/2026 (`docs/meeting-notes/2026-11-18.md`).
> The OpenAPI specification (generated from zod schemas) must match this document. If the two disagree, fix both so they match before merging.

---

## 1. General conventions

| Topic | Convention |
|---|---|
| Base URL | `{VITE_API_URL}/api/v1` (for example `http://localhost:3001/api/v1`). `GET /health` is the exception: no prefix, not versioned. |
| Format | JSON, UTF-8, header `Content-Type: application/json`. |
| JSON field names | English `camelCase` (`showtimeId`, `totalAmount`). Database columns use `snake_case`; the repository/DTO layer converts between them. |
| Endpoint names | Plural nouns, lowercase, `kebab-case` (`/showtimes`, `/booking-combos`). Actions that are not plain CRUD are modeled as sub-resources (`POST /bookings/{id}/payments`). |
| Enum values | Lowercase `snake_case` (`on_sale`, `pending_payment`, `standard`). Exception: movie formats `2D`, `3D`, `IMAX`. |
| IDs | UUID strings. The FE must not assume any ordering or meaning of an ID. |
| Date-time | ISO 8601, **UTC, with `Z` suffix**, e.g. `2026-12-20T12:30:00.000Z`. The FE converts to `Asia/Ho_Chi_Minh` for display (`Intl`); the BE never sends pre-formatted strings. |
| Date (no time) | `YYYY-MM-DD`, interpreted as a calendar day in `Asia/Ho_Chi_Minh` (used by the showtime date filter). |
| Money | **Integer VND**, no decimals, field names end with `Amount` (`priceAmount: 95000`). The FE formats it as `95.000 ₫`. Never strings, never floats. |
| Empty values | A field with no value is `null` (never omitted, never an empty string). Empty collections are `[]`. |
| Request ID | Every response has an `X-Request-Id` header; error bodies also contain it. The FE records it when reporting an error so the team can trace logs. |

### Headers

| Header | Direction | Description |
|---|---|---|
| `Authorization: Bearer <accessToken>` | FE → BE | Required for endpoints that need login. The access token lives 15 minutes and the FE keeps it in memory only. |
| `X-Booking-Token` | FE → BE | For **guests**: the token returned by the seat-hold API, proving ownership of the hold and of the booking created from it (section 7). Logged-in customers use `Authorization` instead. |
| `Idempotency-Key: <uuid>` | FE → BE | Required for `POST /bookings/{id}/payments`. Re-sending the same key returns the previous result and never creates a second payment. |
| `X-Request-Id` | BE → FE | Request identifier, propagated across services. |
| `Retry-After` | BE → FE | Sent with `429`, in seconds. |

### Refresh token

The refresh token is **not** in the body or in a header. The server sets a `refreshToken` cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1/auth`). The FE calls `POST /auth/refresh` and `POST /auth/logout` with `credentials: 'include'` and cannot read this cookie.

---

## 2. Success responses

Every successful response wraps its payload in a `data` key.

**Single object** – `200 OK` (or `201 Created` when creating):

```json
{ "data": { "id": "…", "…": "…" } }
```

**Paginated list** – `200 OK`:

```json
{
  "data": [ { "id": "…" }, { "id": "…" } ],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 134, "totalPages": 7 }
}
```

**No content** (delete, logout) – `204 No Content`, no body.

| Action | HTTP status |
|---|---|
| Successful read | `200` |
| Created (with a `Location` header pointing to the new resource) | `201` |
| Accepted but processed asynchronously (payment) | `202` |
| Deleted / nothing to return | `204` |

---

## 3. Error responses

Every error (4xx, 5xx, including 404 for an unknown route) uses exactly one shape, matching the handlers already in `app.js` of the three services:

```json
{
  "error": {
    "code": "SEAT_ALREADY_HELD",
    "message": "One or more seats are already held by another customer",
    "details": [ { "field": "seatIds[1]", "code": "seat_held", "message": "Seat H8 is held" } ],
    "requestId": "b6f1c7e2-3f4a-4c0e-9a55-1f2d5d0c9a11"
  }
}
```

| Field | Convention |
|---|---|
| `code` | **Uppercase `SNAKE_CASE`, English** error code. The FE branches on `code` only and uses it to pick the Vietnamese message. |
| `message` | English sentence for developers (logs, debugging). **The FE never renders `message` directly to users**; it keeps a `code` → Vietnamese text map. |
| `details` | Optional array, mainly for validation errors and per-seat errors. Each item is `{ field, code, message }`. `field` is a path into the request body (`contact.email`, `seatIds[1]`). |
| `requestId` | Same value as the `X-Request-Id` header. |

The server **never** returns stack traces, SQL statements or database error messages (a `500` is always the generic `INTERNAL_ERROR`).

### Generic error codes

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body, query or params violate the zod schema (with `details`). |
| 400 | `INVALID_QUERY` | A `sort` or filter parameter is not in the allowed list. |
| 401 | `UNAUTHENTICATED` | Missing or wrong `Authorization` / `X-Booking-Token`. |
| 401 | `TOKEN_EXPIRED` | Access token expired. The FE calls `/auth/refresh` and retries **exactly once**. |
| 401 | `TOKEN_INVALID` | Bad signature, `iss`, `aud` or algorithm. The FE signs the user out. |
| 401 | `REFRESH_TOKEN_REUSED` | Reuse of an old refresh token detected; the whole token family is revoked. The FE signs the user out. |
| 403 | `FORBIDDEN` | Logged in but not allowed (customer calling an admin API, manager of cinema A editing cinema B). |
| 404 | `NOT_FOUND` | Resource does not exist, **or belongs to someone else** (IDOR protection; the two cases are indistinguishable). |
| 409 | `EMAIL_ALREADY_EXISTS` | Registering with an email that is already used. |
| 413 | `PAYLOAD_TOO_LARGE` | Body exceeds the size limit. |
| 429 | `RATE_LIMITED` | Rate limit exceeded (with `Retry-After`). |
| 500 | `INTERNAL_ERROR` | Unexpected error. |
| 502 / 504 | `UPSTREAM_UNAVAILABLE` / `UPSTREAM_TIMEOUT` | The payment or notification service did not respond. |

### Business error codes (booking)

Rule for choosing the HTTP status: **409** when the current state of a resource conflicts with the request (seat already held, hold expired); **422** when the request is syntactically valid but violates a business rule.

| HTTP | `code` | Meaning | FE handling |
|---|---|---|---|
| 409 | `SEAT_ALREADY_HELD` | At least one seat is held by someone else. `details` lists the conflicting seats. | Reload the seat map, tell the user which seats were lost, let them choose again. |
| 409 | `SEAT_ALREADY_BOOKED` | Seat already sold. | Same as above. |
| 409 | `HOLD_EXPIRED` | The seat hold has expired or no longer exists. | Go back to seat selection and reset the booking state in the store. |
| 409 | `BOOKING_ALREADY_PAID` | Booking is already paid and a payment was submitted again. | Navigate to the ticket page. |
| 422 | `SHOWTIME_NOT_ON_SALE` | Showtime is not yet on sale, already started or finished (`on_sale` is the only status that allows booking). | Hide the booking button, show an error. |
| 422 | `ORPHAN_SEAT_NOT_ALLOWED` | The selection would leave a single empty seat between two selected/sold seats. | Show an error, let the user reselect. |
| 422 | `SEAT_LIMIT_EXCEEDED` | More than the maximum seats per booking (proposed: 8). | Show an error. |
| 422 | `CANCELLATION_NOT_ALLOWED` | Cancellation is outside the policy (deadline passed or already checked in). | Show the reason, hide the cancel button. |
| 422 | `TICKET_ALREADY_USED` | Ticket already checked in (for the check-in UI). | Show a red warning to the staff member. |

> This list will grow as modules introduce new errors. Process: add the code to this table in the same Pull Request that introduces it, and add it to the zod enum so the generated OpenAPI stays in sync.

---

## 4. Pagination, filtering, sorting

### Pagination

| Parameter | Default | Limits |
|---|---|---|
| `page` | `1` | ≥ 1 |
| `pageSize` | `20` | 1–100. Above 100 returns `400 VALIDATION_ERROR` (not silently capped). |

A list always returns `meta` as in section 2. Every list endpoint is paginated, even small lists.

### Sorting

`sort=<field>` ascending, `sort=-<field>` descending; multiple fields separated by commas: `sort=-startTime,title`. Each endpoint publishes its own **allow-list of sortable fields**; an unknown field returns `400 INVALID_QUERY`. The server never concatenates the `sort` value into SQL.

### Search and filtering

- Autocomplete search: `q=<string>` (minimum 2 characters). The FE debounces by 300 ms.
- Filters use one dedicated parameter per field; multiple values are comma-separated: `format=2D,IMAX`.
- No free-form filter syntax (`filter[...]`, expressions).

Filters of the showtime list `GET /showtimes`:

| Parameter | Type | Example |
|---|---|---|
| `movieId` | UUID | `movieId=…` |
| `cinemaId` | UUID | `cinemaId=…` |
| `date` | `YYYY-MM-DD` | `date=2026-12-20` |
| `format` | `2D` \| `3D` \| `IMAX` (multiple values allowed) | `format=IMAX` |
| `timeSlot` | `morning` (< 12:00) \| `afternoon` (12:00–16:59) \| `evening` (17:00–21:59) \| `night` (≥ 22:00), in `Asia/Ho_Chi_Minh` time | `timeSlot=evening` |
| `status` | showtime status (customers only see `on_sale` by default) | `status=on_sale` |

Allowed sort fields: `startTime`, `priceFrom`.

---

## 5. Endpoints used in the booking flow

Only the endpoints needed by the example in section 6 are listed; the full list lives in the OpenAPI spec.

| Step | Method + path | Auth |
|---|---|---|
| Search movies / showtimes | `GET /movies?q=…`, `GET /showtimes?…` | None |
| View seat map | `GET /showtimes/{showtimeId}/seats` | None |
| Hold seats | `POST /showtimes/{showtimeId}/holds` | None (guest) or `Authorization` |
| List snack combos | `GET /cinemas/{cinemaId}/combos` | None |
| Create booking | `POST /bookings` | `X-Booking-Token` or `Authorization` |
| Pay | `POST /bookings/{bookingId}/payments` | same + `Idempotency-Key` |
| View booking / tickets | `GET /bookings/{bookingId}` | same |
| Look up by code (guest) | `POST /bookings/lookup` | None |
| Cancel booking | `POST /bookings/{bookingId}/cancellation` | same |

---

## 6. Worked example: a guest books 2 tickets

Scenario: a guest without an account books 2 standard seats **H7, H8** for the 19:30 IMAX showtime on 20/12/2026, plus 1 snack combo. All IDs and tokens below are illustrative only.

### Step 1 – Search showtimes

The FE sends:

```http
GET /api/v1/showtimes?movieId=3f6a…&cinemaId=a91c…&date=2026-12-20&format=IMAX&sort=startTime
```

The BE returns `200`:

```json
{
  "data": [
    {
      "id": "5b1d2c9e-6a41-4f0e-8d3a-0c7f1e2a9b10",
      "movie": { "id": "3f6a…", "title": "Dune: Part Three", "posterUrl": "https://…", "durationMinutes": 155 },
      "cinema": { "id": "a91c…", "name": "Cinema District 1" },
      "screen": { "id": "c4d8…", "name": "Screen 1" },
      "format": "IMAX",
      "startTime": "2026-12-20T12:30:00.000Z",
      "endTime": "2026-12-20T15:05:00.000Z",
      "status": "on_sale",
      "priceFromAmount": 95000,
      "availableSeats": 112
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
}
```

### Step 2 – View the seat map

```http
GET /api/v1/showtimes/5b1d2c9e-6a41-4f0e-8d3a-0c7f1e2a9b10/seats
```

The BE returns `200` (abbreviated; the real response contains every seat of the screen):

```json
{
  "data": {
    "showtimeId": "5b1d2c9e-6a41-4f0e-8d3a-0c7f1e2a9b10",
    "rows": 10,
    "columns": 16,
    "seats": [
      { "id": "e1a0…", "row": "H", "number": 7, "label": "H7", "type": "standard", "priceAmount": 95000, "status": "available" },
      { "id": "e1a1…", "row": "H", "number": 8, "label": "H8", "type": "standard", "priceAmount": 95000, "status": "available" },
      { "id": "e1a2…", "row": "H", "number": 9, "label": "H9", "type": "standard", "priceAmount": 95000, "status": "held" },
      { "id": "e1a3…", "row": "J", "number": 3, "label": "J3", "type": "couple", "priceAmount": 190000, "status": "booked" }
    ]
  }
}
```

`type`: `standard` | `vip` | `couple`. `status`: `available` | `held` | `booked`. While the user is choosing seats the FE polls this endpoint periodically (proposed: every 5 seconds); real-time updates via WebSocket belong to the extension group.

### Step 3 – Hold seats (the countdown starts)

After the guest clicks "Continue", the FE sends:

```http
POST /api/v1/showtimes/5b1d2c9e-6a41-4f0e-8d3a-0c7f1e2a9b10/holds
Content-Type: application/json

{ "seatIds": ["e1a0…", "e1a1…"] }
```

The BE returns `201`:

```json
{
  "data": {
    "id": "9d2f7a40-1c3e-4b8a-a6d5-7e0b3f1c2a55",
    "showtimeId": "5b1d2c9e-6a41-4f0e-8d3a-0c7f1e2a9b10",
    "bookingToken": "bk_3Qx9…(long random string)",
    "seats": [
      { "id": "e1a0…", "label": "H7", "type": "standard", "priceAmount": 95000 },
      { "id": "e1a1…", "label": "H8", "type": "standard", "priceAmount": 95000 }
    ],
    "seatsAmount": 190000,
    "createdAt": "2026-12-19T03:00:00.000Z",
    "expiresAt": "2026-12-19T03:05:00.000Z"
  }
}
```

- The FE keeps `bookingToken` **in memory** (store) and sends it in the `X-Booking-Token` header in later steps.
- The FE counts down to `expiresAt` (to reduce clock skew it may use the `Date` response header as its reference). When time runs out the FE returns to seat selection; the BE remains the final authority.
- The hold lasts 5 minutes by default, configured through an environment variable (proposed `HOLD_TTL_SECONDS=300`).

If one of the seats was held by someone else first, the BE returns `409`:

```json
{
  "error": {
    "code": "SEAT_ALREADY_HELD",
    "message": "One or more seats are already held by another customer",
    "details": [ { "field": "seatIds[1]", "code": "seat_held", "message": "Seat H8 is held" } ],
    "requestId": "b6f1c7e2-3f4a-4c0e-9a55-1f2d5d0c9a11"
  }
}
```

Holding is **all or nothing**: on error, none of the requested seats is held.

### Step 4 – Choose snacks (optional)

```http
GET /api/v1/cinemas/a91c…/combos
```

```json
{
  "data": [
    { "id": "f7b3…", "name": "Combo 1 popcorn + 1 drink", "description": "1 large popcorn, 1 drink (32 oz)", "priceAmount": 79000, "imageUrl": "https://…" }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 1, "totalPages": 1 }
}
```

This step only affects FE local state; nothing is sent to the BE until step 5.

### Step 5 – Create the booking (after the guest enters and reviews their details)

```http
POST /api/v1/bookings
X-Booking-Token: bk_3Qx9…
Content-Type: application/json

{
  "holdId": "9d2f7a40-1c3e-4b8a-a6d5-7e0b3f1c2a55",
  "contact": { "fullName": "Nguyen Van An", "email": "an.nguyen@example.com", "phone": "0901234567" },
  "combos": [ { "comboId": "f7b3…", "quantity": 1 } ]
}
```

The BE returns `201` (with the header `Location: /api/v1/bookings/{id}`):

```json
{
  "data": {
    "id": "0a8e5d71-92bc-4c13-b0f4-6d1e7a3c8b22",
    "bookingCode": "CB7K3M9P",
    "status": "pending_payment",
    "showtime": { "id": "5b1d2c9e-…", "movieTitle": "Dune: Part Three", "cinemaName": "Cinema District 1", "screenName": "Screen 1", "format": "IMAX", "startTime": "2026-12-20T12:30:00.000Z" },
    "seats": [
      { "id": "e1a0…", "label": "H7", "type": "standard", "priceAmount": 95000 },
      { "id": "e1a1…", "label": "H8", "type": "standard", "priceAmount": 95000 }
    ],
    "combos": [ { "comboId": "f7b3…", "name": "Combo 1 popcorn + 1 drink", "quantity": 1, "unitAmount": 79000, "lineAmount": 79000 } ],
    "seatsAmount": 190000,
    "combosAmount": 79000,
    "totalAmount": 269000,
    "contact": { "fullName": "Nguyen Van An", "email": "an.nguyen@example.com", "phone": "0901234567" },
    "payment": null,
    "paymentDueAt": "2026-12-19T03:05:00.000Z",
    "createdAt": "2026-12-19T03:02:10.000Z"
  }
}
```

- **Prices are computed by the BE.** The FE never sends prices; it only displays what the BE returns. The FE may compute provisional totals before this step for display only; the BE value is authoritative.
- `paymentDueAt` equals the hold's `expiresAt`: creating a booking does **not** extend the countdown.
- If the hold has expired: `409 HOLD_EXPIRED`.

### Step 6 – Pay (simulated payment service)

```http
POST /api/v1/bookings/0a8e5d71-92bc-4c13-b0f4-6d1e7a3c8b22/payments
X-Booking-Token: bk_3Qx9…
Idempotency-Key: 2f4c1a9e-7b30-4e55-8a1d-9c6b0e3d7f41
Content-Type: application/json

{ "method": "mock_card" }
```

The BE returns `202 Accepted`:

```json
{
  "data": {
    "paymentId": "d3c1b8f0-5a27-4e69-9b04-1f8e2a6c7d90",
    "bookingId": "0a8e5d71-92bc-4c13-b0f4-6d1e7a3c8b22",
    "status": "processing",
    "amount": 269000
  }
}
```

The payment result arrives asynchronously (the payment service calls an HMAC-signed webhook on the core service; **the FE never receives the webhook**). The FE polls:

```http
GET /api/v1/bookings/0a8e5d71-92bc-4c13-b0f4-6d1e7a3c8b22
X-Booking-Token: bk_3Qx9…
```

every 2 seconds for at most 30 seconds, and stops when `payment.status` is `succeeded` or `failed`, or when the booking `status` is no longer `pending_payment`.

On success, `status` becomes `confirmed`:

```json
{
  "data": {
    "id": "0a8e5d71-92bc-4c13-b0f4-6d1e7a3c8b22",
    "bookingCode": "CB7K3M9P",
    "status": "confirmed",
    "totalAmount": 269000,
    "payment": { "id": "d3c1b8f0-…", "status": "succeeded", "failureCode": null },
    "paidAt": "2026-12-19T03:03:41.000Z",
    "tickets": [
      { "id": "7e2b…", "ticketCode": "TK-6H2Q8D1X", "seatLabel": "H7", "status": "valid" },
      { "id": "7e2c…", "ticketCode": "TK-4N9V5B3C", "seatLabel": "H8", "status": "valid" }
    ]
  }
}
```

(abbreviated; the real response contains every field from step 5).

If the simulated payment is rejected, the booking stays `pending_payment` and the payment object becomes `{ "status": "failed", "failureCode": "PAYMENT_FAILED" }`. While the hold is still valid, the FE lets the user retry with a **new** `Idempotency-Key`. If the hold expires without a successful payment, the booking `status` becomes `expired` and the seats are released.

The e-ticket email with the QR code is sent by the notification service after the booking becomes `confirmed`; **the FE never calls the notification service**.

### Step 7 – Look up a ticket by booking code (guest, later)

Lookup requires **both the booking code and the email used when booking**, to prevent code guessing (plus a dedicated rate limit).

```http
POST /api/v1/bookings/lookup
Content-Type: application/json

{ "bookingCode": "CB7K3M9P", "email": "an.nguyen@example.com" }
```

The BE returns `200`; personal data is masked:

```json
{
  "data": {
    "bookingCode": "CB7K3M9P",
    "status": "confirmed",
    "showtime": { "movieTitle": "Dune: Part Three", "cinemaName": "Cinema District 1", "screenName": "Screen 1", "format": "IMAX", "startTime": "2026-12-20T12:30:00.000Z" },
    "seats": [ { "label": "H7" }, { "label": "H8" } ],
    "totalAmount": 269000,
    "contact": { "fullName": "N*** V** A*", "email": "a*********@example.com", "phone": "090****567" },
    "canCancel": true
  }
}
```

An unknown code **or** a mismatching email both return the same `404 NOT_FOUND`.

---

## 7. Guests and ownership

- `bookingToken` is a random string issued by the BE when seats are held; the BE stores only its hash. The token is tied to the hold and to the booking created from it, and becomes invalid once the booking is `confirmed`, `cancelled` or `expired`, or when the hold expires.
- Logged-in customers: ownership is determined by `userId` in the access token; `X-Booking-Token` is not required.
- Missing token, or a token that does not match the resource: `404 NOT_FOUND` (does not reveal whether the resource exists).

---

## 8. Open questions (to be settled before closing v1.0)

1. **When the seat-hold countdown starts.** The meeting notes contain two readings: (a) the hold of 5 minutes starts when the user clicks pay; (b) seats are held as soon as they are chosen and the clock runs through snacks → details → review → payment. This document assumes **(b)** with 5 minutes.
2. **QR code on the ticket page.** Should the FE render the QR from `ticketCode` with a library, or should the BE expose a QR image endpoint? Proposal: the FE renders it; the email QR is generated by the notification service.
3. **Guest mechanism** (`bookingToken`, `POST /bookings/lookup` requiring email) is a Lead proposal and needs confirmation from Phong (M2) and Khanh Le (M3) on storage and security.
4. **Maximum seats per booking** (proposed 8) and the `timeSlot` values.
5. **Booking statuses** used here (`pending_payment`, `confirmed`, `cancelled`, `expired`) will be fully defined in `docs/api/booking-state-machine.md`.
