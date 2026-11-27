# docs

Project documentation for the Cinema Ticket Booking System. Documents are written in Markdown so they can be reviewed in Pull Requests.

## Folders

- `api/`: OpenAPI specification (generated from zod schemas; the first draft is written by hand), API conventions, booking state machine
- `architecture/`: architecture diagrams, SOA, CSR vs SSR comparison
- `database/`: ERD, table descriptions, indexes
- `meeting-notes/`: notes of team meetings, one file per meeting (`YYYY-MM-DD.md`)
- `report/`: final report content
- `requirements/`: use cases and user stories, one file per module
- `assets/`: exported images used by the documents

## requirements/

Each module file contains the use cases and user stories of that module. Use cases are written at one of two levels:

- **Detailed:** preconditions, main steps, error branches, postconditions, related tables and columns.
- **Listed:** ID, name, actor, module, related tables and columns. A listed use case can be upgraded to detailed at any time.

| File | Owner | Use cases | User stories |
|---|---|---|---|
| [admin-operation.md](requirements/admin-operation.md) | Phan Thành Lộc (M5) | UC14, UC17 (UI data: UC13, UC15, UC16, UC18–UC21) | US22, US26 |

Templates are in `requirements/templates/`. Use them for every new use case and user story.
