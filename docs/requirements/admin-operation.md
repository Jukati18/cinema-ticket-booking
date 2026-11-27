# Use Cases and User Stories — Administration & Operation Modules

Owner: Phan Thành Lộc (M5 — Admin/Staff Frontend & QA)  
Created: 22 November 2026  
Status: Draft for team review (SCRUM-25)

## 1. Use Cases in Scope

| Use Case ID | Use Case Name | Primary Actor | Module | Specification Level |
|---|---|---|---|---|
| UC14 | Manage Movies and Genres | Admin | Catalog | Detailed |
| UC17 | Transition Showtime Status | Manager | Operation | Detailed |

---

## 2. Detailed Use Case Specifications

### 2.1. UC14 — Manage Movies and Genres

#### 2.1.1. General Information

| Field | Description |
|---|---|
| Use Case ID | UC14 |
| Use Case Name | Manage Movies and Genres |
| Description / Goal | Enable the Admin to create, view, update, and deactivate or delete movies and movie genres so that the cinema catalog remains accurate and up to date for customers. |
| Primary Actor | Admin |
| Supporting Actors | None |
| Trigger | The Admin navigates to the Movie Management or Genre Management section in the administration portal. |
| Preconditions | 1. The Admin is authenticated and holds the `Admin` role.<br>2. The administration portal is accessible. |
| Success Postconditions | 1. Movie or genre records are created, updated, or deactivated/removed in the system.<br>2. Updated movie catalog information is immediately reflected on customer-facing movie listings. |
| Failure Postconditions | 1. No invalid or partial movie/genre changes are persisted.<br>2. Existing active showtimes and customer bookings remain unaffected. |

#### 2.1.2. Main Flow

- **Step 1 — Admin:** Selects the Movie Management section and chooses to create a new movie or edit an existing movie.
- **Step 2 — System:** Displays the movie management form with required business fields (title, original title, synopsis, duration, release date, age rating, director, cast, poster image, trailer link, genres, and release status).
- **Step 3 — Admin:** Enters or modifies the movie details, assigns one or more genres, and submits the form.
- **Step 4 — System:** Validates that all required fields are present, business formatting rules are satisfied (positive duration, valid release date, valid media links), and selected genres exist.
- **Step 5 — System:** Saves the movie record and displays a confirmation message along with the updated movie list.

#### 2.1.3. Alternative / Exception Flows

##### Flow 1a — Manage Genres (Create / Update / Delete Genre)
- **Flow Type:** Alternative
- **Branch From:** Main Flow Step 1
- **Condition:** The Admin chooses to manage movie genres instead of individual movies.
- **1a.1 — Admin:** Opens the Genre Management view and submits a new genre name, updates an existing genre, or requests deletion of an unused genre.
- **1a.2 — System:** Validates uniqueness of the genre name and checks whether any movies are currently associated with the genre (when deleting).
- **1a.3 — System:** Persists the genre change and displays the updated genre list.
- **Outcome:** Terminate the Use Case.

##### Flow 1b — Deactivate or Delete a Movie
- **Flow Type:** Alternative
- **Branch From:** Main Flow Step 1
- **Condition:** The Admin selects an existing movie to delete or change its status to `ended`.
- **1b.1 — System:** Prompts the Admin with a confirmation dialog before performing the deletion or status change.
- **1b.2 — Admin:** Confirms the action.
- **1b.3 — System:** Verifies that the movie has no active or scheduled showtimes (when deleting), updates or removes the record, and notifies the Admin.
- **Outcome:** Terminate the Use Case.

##### Flow 4a — Invalid or Incomplete Input Data
- **Flow Type:** Exception
- **Branch From:** Main Flow Step 4
- **Condition:** Required fields are missing, duration is zero or negative, or media URLs are malformed.
- **4a.1 — System:** Rejects the submission and highlights the invalid fields with clear validation messages.
- **4a.2 — Admin:** Corrects the highlighted fields and resubmits.
- **Outcome:** Resume Main Flow at Step 4.

##### Flow 1b.3a — Deletion Blocked Due to Active Showtimes or Linked Movies
- **Flow Type:** Exception
- **Branch From:** Alternative Flow 1b.3 (and 1a.2)
- **Condition:** The Admin attempts to delete a movie that has active/scheduled showtimes, or a genre currently assigned to existing movies.
- **1b.3a.1 — System:** Blocks the deletion to preserve data integrity and informs the Admin that the item is currently in use (suggesting changing the movie status to `ended` instead).
- **Outcome:** Terminate the Use Case without deleting the record.

#### 2.1.4. Acceptance Criteria

- **UC14-AC01 — Create a Movie Successfully**
  - **Given:** The Admin is logged in and on the Movie Management page.
  - **When:** The Admin submits a valid movie form with title, positive duration, release date, age rating, poster, and at least one valid genre.
  - **Then:** The system saves the movie, displays a success notification, and shows the new movie in the movie list.
- **UC14-AC02 — Reject Invalid Movie Input**
  - **Given:** The Admin is filling out the create or edit movie form.
  - **When:** The Admin leaves the movie title blank or enters a duration less than or equal to 0 and submits.
  - **Then:** The system prevents saving and displays field-level validation error messages.
- **UC14-AC03 — Prevent Deletion of Movie with Active Showtimes**
  - **Given:** A movie is currently linked to one or more scheduled or on-sale showtimes.
  - **When:** The Admin attempts to delete that movie.
  - **Then:** The system rejects the deletion, keeps the movie record intact, and displays an explanatory warning message.
- **UC14-AC04 — Manage Genres Without Duplicates**
  - **Given:** A genre named "Action" already exists in the system.
  - **When:** The Admin attempts to create another genre named "Action".
  - **Then:** The system rejects the duplicate entry and displays a duplicate genre error message.

#### 2.1.5. Related Data — Business Entities & Attributes

| Business Entity | Required Business Attributes | Database Table | Status |
|---|---|---|---|
| Movie | Movie ID, Title, Original Title, Description, Duration Minutes, Release Date, Age Rating, Director, Cast, Poster URL, Trailer URL, Status (`coming_soon`, `now_showing`, `ended`) | TBD | Proposed |
| Genre | Genre ID, Genre Name, Slug | TBD | Proposed |

#### 2.1.6. Business Rules & Open Questions

- **BR01 — Positive Movie Duration:** A movie's duration must be a positive integer greater than zero minutes. *(Status: Confirmed)*
- **BR02 — Referential Integrity on Deletion:** Movies with scheduled or active showtimes and genres assigned to existing movies cannot be hard-deleted; movies may instead be transitioned to `ended` status. *(Status: Proposed)*
- **Q01 — Poster Image Handling:** Will the Admin input external image URLs directly, or does the system require a file upload mechanism to cloud storage?

---

### 2.2. UC17 — Transition Showtime Status

#### 2.2.1. General Information

| Field | Description |
|---|---|
| Use Case ID | UC17 |
| Use Case Name | Transition Showtime Status |
| Description / Goal | Allow a Cinema Manager to advance the operational lifecycle status of a showtime (`draft` -> `on_sale` -> `started` -> `completed`) within their assigned cinema so that ticket sales and check-in windows are accurately controlled. |
| Primary Actor | Manager |
| Supporting Actors | None |
| Trigger | The Manager selects a showtime in their cinema's schedule and triggers a status transition action. |
| Preconditions | 1. The Manager is authenticated and assigned to a specific cinema complex.<br>2. The target showtime exists and belongs to the Manager's assigned cinema. |
| Success Postconditions | 1. The showtime's status is updated to the next valid lifecycle state.<br>2. Ticket purchasing availability and staff check-in permissions update immediately according to the new status. |
| Failure Postconditions | 1. The showtime remains in its previous status.<br>2. No unauthorized cross-cinema modifications occur. |

#### 2.2.2. Main Flow

- **Step 1 — Manager:** Opens the Showtime Management view for their assigned cinema and locates the target showtime.
- **Step 2 — System:** Displays the showtime details, current status, and only the valid next status transition option(s).
- **Step 3 — Manager:** Selects the action to transition the showtime to the next lifecycle state (`draft` to `on_sale`, `on_sale` to `started`, or `started` to `completed`).
- **Step 4 — System:** Prompts the Manager with a confirmation dialog warning about the operational impact of the status change.
- **Step 5 — Manager:** Confirms the transition.
- **Step 6 — System:** Validates cinema ownership scope, lifecycle transition sequence, and readiness prerequisites (such as room seat map and pricing configuration when opening sales).
- **Step 7 — System:** Updates the showtime status and displays a confirmation message.

#### 2.2.3. Alternative / Exception Flows

##### Flow 5a — Manager Cancels Confirmation
- **Flow Type:** Alternative
- **Branch From:** Main Flow Step 5
- **Condition:** The Manager dismisses or cancels the confirmation dialog.
- **5a.1 — System:** Aborts the transition and keeps the showtime in its current status.
- **Outcome:** Terminate the Use Case.

##### Flow 6a — Invalid State Transition Attempted
- **Flow Type:** Exception
- **Branch From:** Main Flow Step 6
- **Condition:** The requested status transition violates the allowed forward-only lifecycle (`draft` -> `on_sale` -> `started` -> `completed`), such as reverting a `completed` showtime to `on_sale`.
- **6a.1 — System:** Rejects the status update and displays an invalid state transition error.
- **Outcome:** Terminate the Use Case.

##### Flow 6b — Incomplete Prerequisites for Opening Ticket Sales (`on_sale`)
- **Flow Type:** Exception
- **Branch From:** Main Flow Step 6
- **Condition:** The Manager attempts to transition a showtime to `on_sale`, but the assigned screening room lacks an active seat layout or applicable ticket pricing rules.
- **6b.1 — System:** Blocks the transition to `on_sale` and informs the Manager of the missing room or pricing setup.
- **Outcome:** Terminate the Use Case.

##### Flow 6c — Cross-Cinema Access Violation
- **Flow Type:** Exception
- **Branch From:** Main Flow Step 6
- **Condition:** The Manager attempts to modify a showtime belonging to a cinema complex outside their assigned scope.
- **6c.1 — System:** Denies the operation and reports that the showtime resource is unavailable.
- **Outcome:** Terminate the Use Case.

#### 2.2.4. Acceptance Criteria

- **UC17-AC01 — Open Showtime for Ticket Sales**
  - **Given:** A showtime in the Manager's cinema is in `draft` status, and its room seat map and pricing rules are configured.
  - **When:** The Manager transitions the showtime status to `on_sale` and confirms the prompt.
  - **Then:** The showtime status changes to `on_sale`, and the showtime becomes visible and bookable by customers.
- **UC17-AC02 — Enforce Forward-Only Status Lifecycle**
  - **Given:** A showtime is currently in `completed` status.
  - **When:** An attempt is made to transition the showtime back to `on_sale` or `started`.
  - **Then:** The system rejects the request and preserves the `completed` status.
- **UC17-AC03 — Enforce Cinema Scope Isolation**
  - **Given:** Manager A is assigned exclusively to Cinema A, and Showtime X belongs to Cinema B.
  - **When:** Manager A attempts to change the status of Showtime X.
  - **Then:** The system denies the request and leaves Showtime X unchanged.
- **UC17-AC04 — Block Opening Sales Without Pricing or Seat Layout**
  - **Given:** A `draft` showtime is assigned to a room with no configured seat layout or no applicable pricing rules.
  - **When:** The Manager attempts to transition the showtime to `on_sale`.
  - **Then:** The system blocks the transition and displays an error indicating missing prerequisites.

#### 2.2.5. Related Data — Business Entities & Attributes

| Business Entity | Required Business Attributes | Database Table | Status |
|---|---|---|---|
| Showtime | Showtime ID, Cinema ID, Room ID, Movie ID, Start Time, End Time, Format, Status (`draft`, `on_sale`, `started`, `completed`), Updated At | TBD | Proposed |
| Cinema | Cinema ID, Cinema Name | TBD | Proposed |
| Screening Room | Room ID, Room Name, Seat Count | TBD | Proposed |

#### 2.2.6. Business Rules & Open Questions

- **BR01 — Strict Lifecycle Order:** Showtime status transitions must follow the sequential order `draft` -> `on_sale` -> `started` -> `completed` without backward transitions. *(Status: Confirmed)*
- **BR02 — Cinema Scope Restriction:** A Manager can only view and transition showtimes belonging to their assigned cinema complex, whereas an Admin may operate across all cinemas. *(Status: Confirmed)*
- **BR03 — Online Booking Cutoff:** Once a showtime transitions from `on_sale` to `started`, online customer ticket purchases for that showtime are immediately closed. *(Status: Confirmed)*
- **Q01 — Automatic vs. Manual Transition:** Should `started` and `completed` transitions also be triggered automatically by a scheduled background job based on `Start Time` and `End Time`, in addition to manual triggering by the Manager?

---

## 3. Related Data Register — Admin & Staff UI Modules

UI data requirements for Summary Use Cases owned by backend team members:

| UC ID | Business Entity | Required Business Attributes | Database Table | Status |
|---|---|---|---|---|
| UC13 | Cinema | Cinema ID, Cinema Name, Address, City, Phone Number, Status | TBD | Proposed |
| UC13 | Screening Room | Room ID, Cinema ID, Room Name, Format (`2D`, `3D`, `IMAX`), Row Count, Column Count | TBD | Proposed |
| UC13 | Seat | Seat ID, Room ID, Seat Code, Seat Type (`standard`, `vip`, `couple`), Status (`active`, `disabled`) | TBD | Proposed |
| UC15 | Pricing Rule | Pricing Rule ID, Rule Name, Seat Type, Format, Day Type, Time Slot, Price Amount | TBD | Proposed |
| UC15 | Combo | Combo ID, Combo Name, Description, Price Amount, Image URL, Status | TBD | Proposed |
| UC16 | Showtime | Showtime ID, Cinema ID, Room ID, Movie ID, Show Date, Start Time, End Time, Format, Status | TBD | Proposed |
| UC18 | Ticket Check-in | Booking Code, QR Token, Movie Title, Showtime, Room Name, Seat Codes, Customer Name, Check-in Status, Check-in Time | TBD | Proposed |
| UC19 | Audience List | Booking Code, Customer Name, Masked Phone Number, Seat Codes, Check-in Status, Check-in Time | TBD | Proposed |
| UC20 | User Account | User ID, Full Name, Email, Phone Number, Role (`customer`, `staff`, `manager`, `admin`), Assigned Cinema ID, Account Status (`active`, `locked`) | TBD | Proposed |
| UC21 | Operational Report | Date Range, Cinema ID, Movie ID, Total Revenue, Tickets Sold, Occupancy Rate | TBD | Proposed |

---

## 4. User Story Register (M5)

| US ID | User Story Name | Related UC ID | User Story | Status |
|---|---|---|---|---|
| US22 | Manage Movies and Genres | UC14 | As an Admin, I want to create, update, and deactivate movies and genres, so that the cinema catalog stays accurate and up to date. | Draft |
| US26 | Transition Showtime Status | UC17 | As a Manager, I want to open ticket sales and advance the lifecycle status of showtimes in my cinema, so that I can control booking availability and screening operations. | Draft |