# Use Cases and User Stories — Customer Features

Owner: Dương Châu Phát (M4 — Customer Frontend).
Created: 19 November 2026. Updated and cross-checked: 20 November 2026.
Status: draft for team review; not an approved API specification or ERD.

## 1. Use Cases in Scope

| ID | Use case | Primary actors | Module |
|---|---|---|---|
| UC01 | Search movies/showtimes (autocomplete; cinema, date, format and time-range filters) | Guest, Customer | Catalog |
| UC02 | View movie details and showtimes | Guest, Customer | Catalog |
| UC05 | Enter contact details and make payment | Guest, Customer | Booking + Payment |

All three use cases require **detailed specifications** this week according to the team document. For UC05, this document specifies only the frontend portion. A Guest is a user who is not signed in; a Customer is a registered user with a verified email address. The system-wide list and other members' assignments remain in the shared document and are not reassigned to Châu Phát.

## 2. UC01 — Search Movies and Showtimes

| Item | Description |
|---|---|
| ID | UC01 |
| Primary actors | Guest, Customer |
| Module | Catalog |
| Goal | Find a movie or showtime that meets the user's needs |
| Preconditions | The user can access the public area; signing in is not required |
| Trigger | The user enters a keyword or changes showtime filters |
| Input | Keyword; optional cinemaId; screening date; format; time range; pagination parameters defined by the API contract |

### Main Flow

1. The user opens the movie list or showtime page. The system loads movies, cinemas and available filter options.
2. The user enters a movie title. The interface retrieves autocomplete suggestions and displays titles and posters to distinguish the results.
3. The user selects a suggestion with a mouse or keyboard to open UC02, or continues searching and filtering showtimes.
4. The user selects a cinema, date, format and/or time range. No specific cinema selection means All cinemas; the interface does not infer the user's location.
5. The interface submits valid criteria, stores keywords/filters in the URL and resets the results to page 1 whenever the criteria change.
6. The system returns matching results and pagination data. The interface clearly identifies each cinema and displays times in Asia/Ho_Chi_Minh.
7. The user opens a movie or selects a showtime. A selected showtime is passed to UC03 using showtimeId.

### Alternative Flows and Error Handling

- **Empty keyword:** show results using the remaining filters without reporting an input error.
- **No results:** show a message and controls to clear/change filters; do not present showtimes from previous criteria as new results.
- **Rapid keyword changes:** debounce suggestion requests appropriately; cancel or ignore stale responses so they cannot overwrite results for the current keyword.
- **Invalid URL parameters:** normalize them or show an error according to the agreed API rules; do not submit invalid values to the backend.
- **Network/service failure:** show an error, allow retry and preserve valid search criteria.
- **Keyboard interaction:** Up/Down selects suggestions, Enter opens the selected result and Escape closes suggestions; keyboard focus remains visible.

### Postconditions

- **Success:** the user sees matching results or navigates to the selected movie/showtime; the URL reflects the search criteria.
- **No results/failure:** no booking is created, no seats are held and no business data is changed; the user can revise the criteria or retry.

### Data Fields Required by the Interface

- Movie suggestions/list: id, title, posterUrl, durationMinutes, genres, and ageRating when available.
- Cinema: id, name, city; supported formats per cinema when provided by the API.
- Showtime: id, movieId, cinemaId, cinemaName, startsAt, format, language when available, status.
- List response: items, page, pageSize and total according to the approved response envelope.
- Error: code, message, and requestId when available.

## 3. UC02 — View Movie Details and Showtimes

| Item | Description |
|---|---|
| ID | UC02 |
| Primary actors | Guest, Customer |
| Module | Catalog |
| Goal | Understand movie information, view schedules and select a suitable showtime |
| Preconditions | A movieId is available from the list or a direct link; signing in is not required |
| Trigger | The user selects a poster/title or opens the movie detail page |
| Input | movieId; cinema, date, format and time range when filtering showtimes |

### Main Flow

1. The interface loads movie details and showtimes and displays a loading state.
2. It displays the title, poster, genres, duration, synopsis and age classification, plus release date, director, cast, country and language when available.
3. The user reads the information and may open a trailer if a valid URL exists, close the modal and return to the current page.
4. The user selects Choose a showtime. The interface takes the user to that movie's schedule section.
5. The system groups showtimes by cinema and format/language, with times in ascending order within each group. The user can change filters.
6. The user selects an on-sale showtime. The interface passes showtimeId to UC03 and displays the correct movie, cinema, auditorium and time on the seat-selection page.
7. If another showtime already has selected/held seats, the interface requests confirmation before discarding the selection and coordinates release of the old hold with the backend according to the contract.

### Alternative Flows and Error Handling

- **Movie not found:** show a not-found page with a link back to the movie list.
- **Missing supplementary information:** display Updating or omit unavailable fields; do not invent cast, country, trailers or ratings.
- **No matching showtimes:** retain the movie information, show a clear message and allow filter changes.
- **Sales closed/showtime started:** block continuation when this status is known; the backend checks again when holding seats to handle a status change that has just occurred.
- **Loading failure:** show an error and retry control without discarding valid filters.
- **Showtime change canceled:** preserve the existing selection/valid hold rather than clearing it automatically.

### Postconditions

- **Success:** the user sees the correct movie information; if a showtime is selected, UC03 receives the correct showtimeId. Viewing a movie or selecting a showtime does not itself establish a successful seat hold.
- **Failure/canceled action:** no booking or payment is created; a previous hold changes only after a confirmed action and a valid backend response.

### Data Fields Required by the Interface

- Movie details: id, title, posterUrl, synopsis, durationMinutes, genres, ageRating; releaseDate, director, cast, country, language and trailerUrl when available.
- Cinema: id, name, city, and address when available.
- Showtime: id, movieId, cinemaId, cinemaName, roomId, roomName, startsAt, format, language when available, status.
- Showtime statuses use the agreed enum; business statuses in the assignment include on_sale, started and completed.

## 4. UC05 — Contact Details and Payment: Frontend Portion

| Item | Description |
|---|---|
| ID | UC05 |
| Primary actors | Guest, Customer |
| Collaborating system actor | Payment service |
| Module | Booking + Payment |
| Responsibilities | Châu Phát: interface and screen data; Việt: payment processing; Phong: bookings/seat holds |
| Preconditions | A valid seat hold exists from UC03; combo selections from UC04 exist if selected |
| Trigger | The user continues from seat and concession selection |
| Input | holdId, contact details, payment method and an idempotency key according to the API contract |

### Main Flow

1. The interface retrieves the hold and displays the movie, cinema, auditorium, showtime, seats, combos and price breakdown from the backend, together with the remaining hold time.
2. A Guest enters their full name, email and phone number. A Customer may use prefilled profile information and edit ticket-recipient details according to agreed rules.
3. The user selects one simulated payment method. The interface validates required fields using react-hook-form and zod, following rules shared with the backend.
4. The user confirms continuation. The interface prevents repeated submission and requests a booking using holdId, contact details, the method and an idempotency key; frontend-calculated prices are not authoritative.
5. The backend validates the hold, calculates the price and returns booking/transaction identifiers and payment instructions.
6. The interface displays the payment screen for the previously selected method without requesting that choice again. For QR payments, the displayed amount must match the backend transaction.
7. The interface monitors booking/transaction status through the agreed mechanism. A pending transaction remains visibly pending; success is not inferred from URL parameters or a button click.
8. Once the core service confirms the booking, the interface displays the result and booking reference. Generating/emailing the QR ticket proceeds through UC06, owned by Khánh Lê; the SPA does not call the notification service directly.

### Alternative Flows and Error Handling

- **Invalid form:** show errors beside fields, focus the first invalid field and do not request booking creation.
- **Expired hold/hold belongs to another showtime:** block submission, explain the issue and offer a return to seat selection. The backend determines seat release.
- **Price or seat changes:** retrieve updated backend data and ask the user to review it before continuing; do not overwrite another user's hold.
- **Payment failed/canceled/expired:** display the correct status and recovery action. The backend determines whether retry, a new transaction or a new seat hold is allowed.
- **Timeout after submission:** check the booking or idempotency key before retrying creation to avoid duplicate orders.
- **Payment method change:** return to method selection while preserving contact details and a valid hold; handle the old transaction according to payment-service rules so two payable transactions are not active together.
- **Refresh/direct link:** retrieve the current backend status; enforce access rights and personal-data limits according to the contract rather than relying solely on the ID in the URL.

### Postconditions

- **Success:** the core service has confirmed the booking; the interface shows the correct reference and amount and proceeds to UC06. The frontend does not update the database directly or validate payment webhooks.
- **Pending:** the correct pending state and access to the transaction are retained within its valid period; no valid ticket is issued early.
- **Failed/canceled/expired:** no valid ticket is displayed. The interface explains and synchronizes backend status; seat release, refunds and transaction processing belong to the corresponding backend use cases.

### Data Fields Required by the Interface

- Hold: id, showtimeId, seatIds, combos, expiresAt, price breakdown and totalAmount.
- Contact: fullName, email, phone.
- Booking-creation request: holdId, contact, paymentMethod, and an idempotency key in the location specified by OpenAPI.
- Booking/transaction: id, reference, status, paymentStatus, totalAmount, paymentMethod, expiresAt, and simulated-payment instructions specific to the method.
- Summary: movie, cinema, auditorium, time, seats and combos from the backend snapshot.
- Error: code, message, and fieldErrors when available; never return passwords/tokens or another customer's personal information.

Field names are frontend proposals, not an approved schema. Enums and the relationship between booking/payment statuses must be agreed with Việt and Phong.

## 5. User Stories Owned by Châu Phát

IDs and content follow the shared list, with acceptance criteria added. These are requirements, not a checklist claiming the implementation already satisfies them.

### US01 — Movie Search Suggestions

**As a guest, I want to type a movie title and immediately see suggestions so that I can find it quickly.**

Acceptance criteria:
1. A matching keyword produces title/poster suggestions; selecting one opens the correct UC02 page.
2. Loading, empty and error states are provided, including retry on failure.
3. Responses for old keywords cannot replace results for a newer keyword.
4. Suggestions support keyboard selection; Enter opens a result and Escape closes the list.
5. Clearing the keyword restores results under the remaining filters without changing quick-booking data.

### US02 — Filter Showtimes

**As a guest, I want to filter showtimes by cinema, date, format and time range so that I can choose a suitable screening.**

Acceptance criteria:
1. Filters combine; results satisfy all selected criteria.
2. All cinemas is the default; the interface does not filter by inferred location. Multi-cinema results clearly identify each cinema.
3. Dates/times are displayed and filtered in Asia/Ho_Chi_Minh; only valid format choices are offered.
4. Criteria are stored in the URL and valid criteria survive refresh; changing filters resets results to page 1.
5. Times are ascending within each cinema/format group; only on-sale showtimes can proceed to booking.
6. Empty results include an explanation and controls to change/clear filters. Loading failures must not be disguised as empty results.

### US03 — View Movie Details

**As a guest, I want to view movie details (synopsis, duration and genres) so that I can decide whether to watch it.**

Acceptance criteria:
1. Opening a movie from the list or a direct URL displays the correct movie for movieId.
2. Title, poster, synopsis, duration and genres are shown; available supplementary information is displayed without inventing missing data.
3. The schedule belongs to that movie, and a suitable showtime can be selected to proceed to UC03.
4. An unknown movie produces a not-found state; a movie without showtimes remains readable and schedule criteria can still be changed.
5. An available trailer can be opened/closed without losing valid page selections.
6. Viewing a movie/selecting a showtime does not automatically create a booking or confirm a seat hold.

## 6. Collaboration References Without Reassigning Ownership

| Referenced work | Owner in the team document | Châu Phát's role |
|---|---|---|
| UC03, UC04, UC07, UC22; US04–US10 | Phong | Display seat maps, combos, statuses and lookup forms using agreed data/rules |
| UC08; US11 | Phong; Việt handles refunds | Cancellation UI in the relevant sprint; do not define refund policy independently |
| Payment portion of UC05, UC23; US12, US13, US15 | Việt | Method-selection UI and result monitoring/display; webhook verification remains outside frontend ownership |
| UC06; US14 | Khánh Lê | Display system-provided ticket-email/QR results |
| Authentication, profile and history | Khánh Lê | Integrate the corresponding UI in the relevant sprints |

US09, US12 and US13 are not counted as separate user stories owned by Châu Phát in SCRUM-22; their frontend interaction is covered in UC05. Lộc owns Admin/Staff frontend and QA under the overall plan.

## 7. Data and Decisions Requiring Team Agreement

- IDs are API-provided identifiers; the frontend does not infer ownership or authorization from an ID.
- Money is represented as integer VND; timestamps use ISO 8601 with an offset/UTC; date filtering follows Vietnam's timezone.
- The backend defines table names, relationships, constraints and storage. Fields above express screen DTO requirements only.
- Phong and Việt confirm response envelopes, pagination, enums, errors, seat-hold rules, pricing, guest-booking access, idempotency and transaction lifecycles.
- Khánh Lê aligns shared validation/schemas, profile data and email/QR delivery results.
- OpenAPI and the ERD must be finalized by the end of Sprint 1 under the plan. The [frontend–backend communication proposal](../api/frontend-backend-proposal.md) is a coordination document, not a replacement for the approved contract.

## Appendix — Related Technical Documents

These documents support SCRUM-23/24 implementation and do not replace the use cases/user stories above:
- [Frontend–backend communication proposal](../api/frontend-backend-proposal.md).
- [Sprint 1 frontend handoff](frontend-sprint1-handoff.md).
