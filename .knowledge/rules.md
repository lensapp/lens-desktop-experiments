# Experiment-Specific Rules

These constraints exist because experiments ship out of this repo but run inside Lens Desktop, which consumes them as signed artifacts. They apply to experiment work only — not to general monorepo development.

## 1. The host surface spans two scopes, and is third-party either way

Host packages are consumed at their published versions. No source imports, path aliases, or workspace links into `../lens-desktop-monorepo/`. Only symbols re-exported from a package's `index.ts` are reachable — nothing from `_private/` or unpublished internals.

The scope tells you where a package is published, not what it does:

| Scope | Registry | Auth to install |
|-------|----------|-----------------|
| `@k8slens/*` | npmjs | none |
| `@lensapp/*` | GitHub Packages | yes |

Which scope a given package uses is **not guessable** — the DI machinery, feature-core, the design system and the contracts packages moved to `@k8slens` (`injectable`, `injectable-react`, `injectable-extension-for-mobx`, `fp`, `feature-core`, `composable-responsibilities`, `element-components`, `icon`, `test-utils`, `package-build`, `typescript`, plus the `*-contracts` packages), while the business and UI packages an experiment consumes stayed on `@lensapp` (`application`, `messaging`, `telemetry`, `theme`, `top-bar`, `utilities`, …). Read the authoritative list before writing an import; guessing produces a bundle that fails its first `require` inside the sandbox with *"not a public Lens extension API"*.

### The authoritative list, and its three tiers

The host advertises exactly what an extension may `require`, one file per package, in the monorepo at `packages/features/extension-development/src/<package>/extension-dependency.injectable.ts`. The function each file calls is the tier:

| Declared with | Tier | Reachable from an experiment |
|---------------|------|------------------------------|
| `asExtensionDependency` | public-for-all | always |
| `asInternalExtensionDependency` | internal | yes — a signed experiment from the verified catalog is granted the internal tier (`lab-experiment-catalog`'s `verifiedExperimentInternalTierGrantInjectable`) |
| `asExtensionDependencyForDevelopmentOnly` | development-only | dev builds only, so `channels: ["dev"]` experiments only. Currently `living-docs` and `test-utils-for-production` |

A `require` of anything not on that list throws at install time, so the experiment never loads. Version ranges declared here are **not** checked at runtime for a published experiment — `generate-runtime-package-json.ts` emits only `name`, `version` and `main` — but they are what `npm install` and `tsc` resolve locally, so keep them honest.

A breaking change in a published host package becomes a `peerDependencies` bump here, and that bump is only safe for Lens versions whose releases already contain the new package version.

## 2. Additions over changes — ideally zero monorepo changes

The default assumption when starting an experiment is that the existing public API is enough. When it isn't:

- **Prefer additive PRs**: a new injection token, a new `index.ts` re-export, a new injectable implementing an existing token. These are safe for every existing consumer and every prior experiment.
- **Avoid changes or removals** to existing tokens, types, or exported signatures to make an experiment fit.
- If only a non-additive change works, treat it as a signal to design a new extension point rather than modify an existing one.

This additive bias is scoped to experiment-support work — general monorepo refactoring follows its own rules.

**Sequencing**: the additive PR lands in the monorepo, the affected host package is released, **then** the experiment bumps its `peerDependencies` and is tagged against a Lens version that contains the new package version. Cutting an experiments tag against a Lens version that predates the supporting PR will fail at runtime.

## 3. Lens version ↔ experiment tag pairing

Lens Desktop and experiments have independent version numbers. They're paired at publish time by the release tag in this repo:

- **Tag format**: `<lensVersion>.<numericSuffix>` (e.g. `2025.12.0.3`).
- **At runtime**, Lens scans this repo's GitHub releases, keeps tags starting with `${appVersion}.`, picks the highest numeric suffix, and fetches that manifest.
- A Lens version with no matching tag → empty catalog, no fallback.

Operational check: the release workflow trigger in this repo must accept that same tag pattern. If CI is still configured for a different trigger, the runtime contract is still `<lensVersion>.<suffix>` and publishing must happen via manual dispatch or after updating the workflow.

Implication: anything you need from the monorepo must already be in the host package versions bundled into the Lens release that a matching experiments tag will target.

This cuts both ways for a scope rename. Bundles built after the `@lensapp` → `@k8slens` migration only load in Lens versions that serve the new names; the artifacts already published for older Lens versions keep working because release artifacts are immutable. So do **not** backfill (`.github/workflows/backfill-releases.yml`) to Lens versions that predate the migration — those clients would fetch a bundle whose first `require` they refuse.
