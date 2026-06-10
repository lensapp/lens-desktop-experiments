# Change Management

This repository follows Mirantis's change-management process for code changes
to the `main` branch.

## Controls

Changes to `main` are governed by GitHub branch protection and a repository
ruleset that together require:

- A pull request before merging (no direct pushes to `main`).
- At least one approving review from a reviewer other than the change author,
  with stale reviews dismissed on new pushes.
- The `build` status check (from the `Build & Test` workflow, which runs
  `npm run build`, `npm run typecheck`, `npm run lint`, and `npm test`) to
  pass before merge.
- No force-pushes to `main`.
- No deletion of `main`.

These controls are enforced by GitHub and recorded in the repository's
ruleset history and audit log:

- Ruleset: <https://github.com/lensapp/lens-desktop-experiments/rules/16631125>
- Branch protection on `main`: <https://github.com/lensapp/lens-desktop-experiments/settings/branches>

## Effective date

The current set of controls described above has been in effect since
**2026-05-20**, when the "Main branch protection" ruleset was enabled
(blocking deletion and force-push) on top of pre-existing pull-request and
review requirements on `main`.

Changes merged before this date predate the full enforced control set. The
enabled ruleset and required status check are the remediation; no
retroactive review of pre-existing changes has been performed or is implied
by this document.

## Reference

This repository's process implements Mirantis's
[Software Development Process](https://mirantis.jira.com/wiki/spaces/LENS/pages/5216174082/Software+Development+Process).
For the authoritative policy and SOC 2 control mapping, see that document.
