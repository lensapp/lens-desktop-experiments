# Agent Instructions for Lens Desktop Experiments

This repo holds **lab experiments** — renderer-only CommonJS bundles that Lens Desktop fetches, verifies, and loads at runtime. Each experiment is a self-contained workspace under `experiments/<id>/`.

## Read First

This file is the entry point for experiment work — read it top-to-bottom before touching anything under `experiments/`.

Writing an experiment is nearly identical to writing any Lens feature: same DI, MobX, React, testing, and commit conventions. The monorepo's shared knowledge still applies when authoring the code — you need both this file and those categories in context:

- `../lens-desktop-monorepo/.knowledge/technical/architecture/` — SOLID, contracts packages, telemetry.
- `../lens-desktop-monorepo/.knowledge/technical/di/` — injection tokens, injectables, feature registration.
- `../lens-desktop-monorepo/.knowledge/technical/react/` — component patterns and UI conventions.
- `../lens-desktop-monorepo/.knowledge/technical/mobx/` — observables and transactionality.
- `../lens-desktop-monorepo/.knowledge/technical/testing/` — test structure, mocking, patterns.
- `../lens-desktop-monorepo/.knowledge/technical/anti-patterns/` — what to avoid.
- `../lens-desktop-monorepo/.knowledge/technical/workflow/conventional-commits.md` — commit message format.

What's **experiment-specific** — delivery format, publishing, cross-repo sequencing, contract surface — is captured below.

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

## Authoring Rules (Experiment-Specific)

These constraints exist because experiments ship out of this repo but run inside Lens Desktop, which consumes them as signed artifacts. They apply to experiment work only — not to general monorepo development.

### 1. `@lensapp/*` are third-party

Consume them at their published versions from GitHub Packages. No source imports, path aliases, or workspace links into `../lens-desktop-monorepo/`. Only symbols re-exported from a package's `index.ts` are reachable — nothing from `_private/` or unpublished internals.

A breaking change in a published `@lensapp/*` package becomes a `peerDependencies` bump here, and that bump is only safe for Lens versions whose releases already contain the new package version.

### 2. Additions over changes — ideally zero monorepo changes

The default assumption when starting an experiment is that the existing public API is enough. When it isn't:

- **Prefer additive PRs**: a new injection token, a new `index.ts` re-export, a new injectable implementing an existing token. These are safe for every existing consumer and every prior experiment.
- **Avoid changes or removals** to existing tokens, types, or exported signatures to make an experiment fit.
- If only a non-additive change works, treat it as a signal to design a new extension point rather than modify an existing one.

This additive bias is scoped to experiment-support work — general monorepo refactoring follows its own rules.

**Sequencing**: the additive PR lands in the monorepo, the affected `@lensapp/*` package is released, **then** the experiment bumps its `peerDependencies` and is tagged against a Lens version that contains the new package version. Cutting an experiments tag against a Lens version that predates the supporting PR will fail at runtime.

### 3. Lens version ↔ experiment tag pairing

Lens Desktop and experiments have independent version numbers. They're paired at publish time by the release tag in this repo:

- **Tag format**: `<lensVersion>.<numericSuffix>` (e.g. `2025.12.0.3`).
- **At runtime**, Lens scans this repo's GitHub releases, keeps tags starting with `${appVersion}.`, picks the highest numeric suffix, and fetches that manifest.
- A Lens version with no matching tag → empty catalog, no fallback.

Implication: anything you need from the monorepo must already be in the `@lensapp/*` versions bundled into the Lens release that a matching experiments tag will target.

## Cross-Repo Contract Surface

Some monorepo files are part of a **cross-repo contract** with this repo — a change on either side breaks already-shipped experiments unless coordinated. If you're touching (or asking a monorepo author to touch) any of these, treat it as a coordinated release, not a routine change.

| Surface | Monorepo location | This repo's counterpart |
|---------|-------------------|-------------------------|
| GitHub Release URLs | `packages/features/experimental-features/lab-experiment/src/_private/experiments-repo-urls.ts` | Release artifact layout produced by `.github/workflows/release.yml` |
| Manifest schema (zod) | `packages/features/experimental-features/lab-experiment/src/_private/fetch-manifest.injectable.ts` | `infrastructure/publish/generate-manifest.ts` output shape |
| Release tag pattern `<lensVersion>.<suffix>` | `packages/features/experimental-features/lab-experiment/src/_private/resolve-experiments-release-tag.injectable.ts` | Tag chosen when cutting a release |
| Ed25519 public key (PEM) | `packages/features/experimental-features/lab-experiment/src/_private/public-key.injectable.ts` | `EXPERIMENT_SIGNING_PRIVATE_KEY` GH Actions secret |
| Signing algorithm (Ed25519 over the fetched content's UTF-8 bytes, signature base64-encoded) | `packages/features/experimental-features/lab-experiment/src/_private/verify-ed25519-signature.injectable.ts` | `infrastructure/sign/sign-bundle.ts` |
| SHA-256 checksum over the fetched content's UTF-8 bytes | `packages/features/experimental-features/lab-experiment/src/_private/verify-sha256-checksum.injectable.ts` | `infrastructure/publish/generate-manifest.ts` |
| Load mechanism: ephemeral extension | `installExtensionAsEphemeralDirectlyInjectionToken` from `@lensapp/dynamic-features-contracts` | The experiment bundle shape that mechanism expects |

### Key rotation

Rotating the signing keypair is a coordinated cross-repo ship:

1. Generate a new keypair (`infrastructure/sign/generate-keypair.ts`).
2. Update the `EXPERIMENT_SIGNING_PRIVATE_KEY` secret in this repo.
3. Update the PEM constant in `publicKeyInjectable` in the monorepo.
4. Release the monorepo; only then cut the next experiments tag signed with the new key. Until the new monorepo release is live, clients on the old public key will reject the new signatures.

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
