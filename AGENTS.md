# Agent Instructions for Lens Desktop Experiments

This repo holds **lab experiments** — renderer-only CommonJS bundles that Lens Desktop fetches, verifies, and loads at runtime. Each experiment is a self-contained workspace under `experiments/<id>/`.

## Knowledge Base

Experiment-specific knowledge lives in `.knowledge/`. Read the file for your task before touching code.

| Task | Reading |
|------|---------|
| Starting work on a new experiment from a user request | [.knowledge/starting-a-new-experiment.md](./.knowledge/starting-a-new-experiment.md) |
| Creating a new experiment / laying out `experiments/<id>/` | [.knowledge/authoring.md](./.knowledge/authoring.md) |
| Understanding what you can and can't import from the monorepo | [.knowledge/rules.md](./.knowledge/rules.md) |
| Touching anything that crosses the monorepo boundary (manifest, signing, URLs, tag pattern, key) | [.knowledge/cross-repo.md](./.knowledge/cross-repo.md) |
| Running build / typecheck / tests, local dev in Lens, publishing | [.knowledge/build.md](./.knowledge/build.md) |

Start from [.knowledge/README.md](./.knowledge/README.md) if unsure.

## General Lens Desktop Knowledge Also Applies

Writing an experiment is nearly identical to writing any Lens feature: same DI, MobX, React, testing, and commit conventions. The monorepo's shared knowledge is load-bearing when authoring the code — you need both this repo's `.knowledge/` and the relevant monorepo categories in context:

| Task | Reading |
|------|---------|
| Architecture decisions (SOLID, contracts packages) | `../lens-desktop-monorepo/.knowledge/technical/architecture/` |
| Creating/modifying injectables | `../lens-desktop-monorepo/.knowledge/technical/di/` |
| Creating/modifying React components | `../lens-desktop-monorepo/.knowledge/technical/react/` |
| Using MobX observables | `../lens-desktop-monorepo/.knowledge/technical/mobx/` |
| Writing tests | `../lens-desktop-monorepo/.knowledge/technical/testing/` |
| Avoiding known anti-patterns | `../lens-desktop-monorepo/.knowledge/technical/anti-patterns/` |
| Making commits | `../lens-desktop-monorepo/.knowledge/technical/workflow/conventional-commits.md` |

From the point of view of designing, implementing, testing, and reviewing the code, treat experiment code as normal Lens feature code. The only experiment-specific parts are delivery constraints: public-package consumption, cross-repo contracts, local install flow, signing, and publishing.

Review standard: hold experiment code to the same architecture, testing, and code-review bar as monorepo code. Do not accept weaker structure or test discipline just because the code ships from the experiments repo.

## Workflow

1. Identify the task from the tables above.
2. Read the relevant `.knowledge/` file(s) here, then any cross-referenced monorepo category.
3. Use `experiments/hello-world/` as the default template; use `experiments/dev-tools/` for multi-feature structure only unless the task explicitly needs its heavier shape.
4. Verify locally: `npm run build:experiment -- <id>`, `npm run typecheck`, `npm test`, and install-from-filesystem in Lens Desktop.
