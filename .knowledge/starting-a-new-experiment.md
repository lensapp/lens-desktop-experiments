# Starting A New Experiment

The entry point when a user says "build an experiment for X." Read this before `authoring.md`.

This playbook exists to keep agents from jumping straight into `experiments/<id>/` without first checking whether the monorepo already exposes the required public surface.

Important framing: once you are inside the experiment code itself, build it the same way you would build an in-monorepo Lens feature. Architecture choices, test quality, and review expectations stay the same. What changes is only the delivery model around that code.

## 1. Understand The User-Level Goal

Get clear on:

- what the experiment should do for the user
- which host surfaces it touches: status bar, command palette, preferences, application page, cluster view, onboarding, and so on
- whether it is mainly a business-facing experiment or a technical/internal tool

If the experiment touches an existing Lens product area, read the relevant product docs in `../../lens-desktop-monorepo/.knowledge/product/` before designing the feature. Do not infer user-facing behavior purely from implementation files when product docs already exist.

## 2. Inspect Only Public Monorepo APIs

Before writing experiment code, inspect the public APIs of the relevant `@lensapp/*` packages.

- Start from each package's `index.ts`.
- Treat the monorepo as a third-party dependency.
- Do **not** design against `_private/` files, path aliases, or unpublished internals.

Goal: answer "Can the experiment be built against what Lens already publishes?"

## 3. Decide Whether Monorepo Support Is Needed

Bias toward **no monorepo changes**.

Ask, in order:

1. Does the existing public API already support the experiment? If yes, continue here.
2. If not, can the gap be solved by a **purely additive** monorepo change:
   a new injection token, a new `index.ts` re-export, or a new injectable implementing an existing token?
3. If it would require changing or removing an existing contract, stop and redesign around a new extension point instead of forcing the experiment through a breaking change.

If monorepo support is needed, read [rules.md](./rules.md) and [cross-repo.md](./cross-repo.md), then land one dedicated additive PR in the monorepo first. Only after the needed `@lensapp/*` package version is published should the experiment depend on it here.

## 4. Pick The Right Reference Shape

Now switch to experiment authoring.

- Use `experiments/hello-world/` as the default template.
- Use `experiments/dev-tools/` for multi-feature composition and larger structure only.
- Then read [authoring.md](./authoring.md) for layout, `feature.ts`, `package.json`, and checklist details.

## 5. Build And Try It Locally In Lens

Read [build.md](./build.md), then run the normal dev loop:

1. `npm run build:experiment -- <id>`
2. `npm run generate-package-json` if `dist/package.json` is needed
3. Install from filesystem in Lens Desktop using `experiments/<id>/dist/package.json`
4. Rebuild while iterating

This local-extension path bypasses signed catalog delivery. It is the correct dev loop, but it does **not** prove the publishing path.

## 6. Publish Only Against A Compatible Lens Version

When the experiment is ready to ship:

- tag it for a Lens version that already contains any required supporting monorepo package releases
- follow the tag contract and publishing notes in [rules.md](./rules.md) and [build.md](./build.md)

If the release automation in this repo still does not match the runtime tag format, do not assume push-tag publishing works. Verify the workflow trigger first.
