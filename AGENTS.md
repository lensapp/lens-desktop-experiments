# Agent Instructions for Lens Desktop Experiments

This repo holds **lab experiments** — renderer-only CommonJS bundles that Lens Desktop fetches, verifies, and loads at runtime. Each experiment is a self-contained workspace under `experiments/<id>/`.

## Read First

If you're starting work on an experiment, the entry-point playbook lives in the Lens Desktop monorepo:

```
../lens-desktop-monorepo/.knowledge/technical/experiments/starting-a-new-experiment.md
```

That playbook is the orchestrator — it tells you when to work here versus when to land a supporting PR in the monorepo. Read it before this file.

Additional monorepo-side knowledge you may need:

- `../lens-desktop-monorepo/.knowledge/technical/experiments/working-with-experiments.md` — core rules (third-party, additions-over-changes, independent versioning) + cross-repo contract surface.
- `../lens-desktop-monorepo/.knowledge/technical/experiments/monorepo-consumption.md` — how Lens resolves release tags, fetches, verifies, and installs experiments.

## What This Repo Owns

Everything specific to **authoring and publishing** experiments:

- Per-experiment directory layout and templates
- `feature.ts` / `package.json` / `tsconfig.json` conventions
- Shared esbuild config, glob-import plugin, type-check, test runner
- Sign / manifest / release automation

The monorepo side owns: consumer packages, cross-repo contract definitions (manifest schema, URLs, public key, tag pattern), and the overall workflow across the two repos.

## Reference Implementations

Always read one of these before creating a new experiment:

| Experiment | Shape | Use As Template When |
|------------|-------|----------------------|
| `experiments/hello-world/` | Minimal single-feature experiment with one injectable | Adding a small, self-contained experiment |
| `experiments/dev-tools/` | Larger experiment exporting multiple features (tools + in-general) | Experiment spans several tools / subdomains |

## Experiment Directory Layout

```
experiments/<experiment-id>/
├── index.ts                 # Re-exports renderer feature(s) — entry for esbuild
├── package.json             # Experiment metadata + peerDependencies
├── tsconfig.json            # Extends ../../tsconfig.base.json
└── src/
    └── renderer/            # (hello-world) or src/<domain>/ (dev-tools)
        ├── feature.ts
        └── *.injectable.(ts|tsx)
```

`dist/` is produced by the shared esbuild pipeline — never hand-write or commit it.

### `index.ts`

Re-export file only, no logic:

```ts
// experiments/hello-world/index.ts
export { helloWorldRendererFeature } from "./src/renderer/feature";
```

Multiple features are fine (see `dev-tools/index.ts`).

### `feature.ts`

Uses `@lensapp/feature-core`'s `getFeature` with **glob-imported injectables**. The glob is resolved by `infrastructure/build/glob-import-plugin.ts` and declared in the top-level `global.d.ts`.

```ts
import { getFeature } from "@lensapp/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import { statusBarFeature } from "@lensapp/status-bar";

export const helloWorldRendererFeature = getFeature({
  id: "hello-world-renderer",
  tags: ["public", "renderer", "business"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [statusBarFeature],
});
```

Rules:

- `tags` always includes `"renderer"` — experiments run renderer-only.
- Pick `"business"` vs `"technical"` the same way as in-monorepo features (`dev-tools` → technical; `hello-world` → business).
- Every package listed in `dependencies` must also be in the experiment's `peerDependencies` — they resolve from the host at runtime, not the bundle.

### `package.json`

Required structure (see `experiments/hello-world/package.json` for a complete example):

1. `"experiment"` block with `id`, `name`, `description`, `terminationUtcDateTime` (ISO 8601 UTC). Every experiment must declare a termination date — beyond it, the experiment is expected to be removed (graduated into the monorepo or deleted).
2. `"main": "./dist/index.js"` and matching `exports`.
3. Every `@lensapp/*` / framework package the feature consumes at runtime listed in **both** `peerDependencies` and `devDependencies`.

### Injectables

Standard monorepo DI conventions apply: `getInjectable`, injection tokens for public contracts, `_private/` for internals. Experiments are DI-registered exactly like in-monorepo features — the only difference is the delivery mechanism. See `../lens-desktop-monorepo/.knowledge/technical/di/` if you need a refresher.

## Authoring Rules (Come From The Monorepo Side)

These constraints are enforced here because they're what the monorepo depends on. Full rationale in `../lens-desktop-monorepo/.knowledge/technical/experiments/working-with-experiments.md`.

1. **`@lensapp/*` are third-party**: consume them at their published versions from GitHub Packages. No source imports, path aliases, or workspace links into `../lens-desktop-monorepo/`. Only public exports — nothing from `_private/`.
2. **Prefer no monorepo changes**: design against the existing public API. If you hit a gap, **stop and coordinate a purely-additive PR on the monorepo side** (grouped into one dedicated PR for the experiment) before adding the import here.
3. **Lens version ↔ experiment tag pairing**: the release tag `<lensVersion>.<numericSuffix>` is what pairs a build to a Lens version. Bumping `peerDependencies` to a newer `@lensapp/*` version is only safe once a Lens release contains it and you're tagging against that Lens version.

## What The Build Treats As External (NOT Bundled)

`infrastructure/build/esbuild.config.ts` marks these as external; the bundle imports them from the host DI container's module graph at load time:

```
node:* builtins, @lensapp/*, mobx, zod, electron, react, react-dom
```

Anything else you import **will be bundled into `dist/index.js`**. Keep bundles small — prefer host-provided `@lensapp/*` packages over re-implementing.

## Commands

```bash
# Install — requires GitHub Packages auth for @lensapp scope
npm install

# Build
npm run build                                # all experiments
npm run build:experiment -- <experiment-id>  # single

# Verify
npm run typecheck                            # tsc --noEmit per experiment
npm test                                     # jest across experiments/*/src/**/*.test.(ts|tsx)

# Publishing prep (normally only run by CI)
npm run generate-package-json                # writes dist/package.json per experiment
npm run sign                                 # requires EXPERIMENT_SIGNING_PRIVATE_KEY
npm run manifest                             # writes dist/manifest.json
```

Tests use `jest-fixed-jsdom` + `@lensapp/package-build/transformer`, scoped by `testMatch: ["**/experiments/*/src/**/*.test.{ts,tsx}"]`.

## Local Dev Loop In Lens Desktop

To try an experiment in a running Lens Desktop before publishing:

1. `npm run build:experiment -- <id>` (and `npm run generate-package-json` if you haven't, so `dist/package.json` exists).
2. In Lens Desktop → **Preferences → Extensions → "Install from filesystem"** → select `experiments/<id>/dist/package.json`.
3. Lens installs it as a local extension and starts hot-feature-replacement, so subsequent rebuilds reload the experiment live.

This path bypasses signing / manifest / catalog — it does not validate the signed-catalog flow. Re-test through the catalog with a real release tag before shipping.

## Publishing

Tag the repo `<lensVersion>.<numericSuffix>` (e.g. `2025.12.0.3`). `.github/workflows/release.yml` builds, signs, generates the manifest, and publishes the GitHub Release. Running Lens clients on that `lensVersion` pick it up automatically.

## Adding A New Experiment — Checklist

- [ ] New directory `experiments/<id>/` modeled on `hello-world` (simple) or `dev-tools` (multi-feature)
- [ ] `index.ts` re-exports the feature(s)
- [ ] `package.json` has the `experiment` block with a real `terminationUtcDateTime`
- [ ] Every runtime import is in `peerDependencies` (and `devDependencies`) at the **published** version — no source/workspace links
- [ ] Only public exports of `@lensapp/*` packages are imported — nothing from `_private/` or unpublished internals
- [ ] Any needed monorepo support is **additive** and landed in **one dedicated PR** over there before being depended on here
- [ ] Release-tag plan is clear: which Lens version(s) will this be tagged under once ready to publish
- [ ] `feature.ts` uses `getFeature` with glob-imported injectables and `"renderer"` tag
- [ ] `npm run build:experiment -- <id>`, `npm run typecheck`, `npm test` all pass
- [ ] Verified locally via Preferences → Install from filesystem
- [ ] `dist/` is not hand-edited or committed
