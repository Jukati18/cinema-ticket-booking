# Team conventions

## Branches (Git)

- `main`: always runnable, protected, merged only via Pull Request with green CI.
- Working branches are created from `main` and named `<name>-sprint-<x>`:
  `viet-sprint-1`, `phat-sprint-2`.
- Keep branches short-lived (1-3 days) and rebase or merge `main` often.

## Commits (Conventional Commits)

Format: `<type>(<scope>): <short description, present tense>`

| type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Config, build, dependencies |
| `docs` | Documentation |
| `test` | Add or change tests |
| `refactor` | Code restructuring without behavior change |
| `ci` | GitHub Actions |

`scope` is the module: `api`, `payment`, `notification`, `web`, `docker`, `ci`, `docs`.
Example: `feat(api): add showtime list endpoint`.

## Pull Requests

- Each PR is linked to one Jira ticket; fill in `pull_request_template.md`.
- At least 1 reviewer is required (the Team Lead reviews PRs touching config, Docker and CI).
- CI must be green before merging; use "Squash and merge".
- Never push directly to `main`.

## Code rules

- ES Modules (`"type": "module"`), Node 22+.
- File names, variables, tables, columns, endpoints and JSON fields are in English.
- Never commit `.env`, secrets, `node_modules` or `dist`.
- Empty directories are kept with `.gitkeep`; delete the `.gitkeep` once a directory contains real files.
