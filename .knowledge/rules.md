# Experiment-Specific Rules

These constraints exist because experiments ship out of this repo but run inside Lens Desktop, which consumes them as signed artifacts. They apply to experiment work only — not to general monorepo development.

## 1. `@lensapp/*` are third-party

Consume them at their published versions from GitHub Packages. No source imports, path aliases, or workspace links into `../lens-desktop-monorepo/`. Only symbols re-exported from a package's `index.ts` are reachable — nothing from `_private/` or unpublished internals.

A breaking change in a published `@lensapp/*` package becomes a `peerDependencies` bump here, and that bump is only safe for Lens versions whose releases already contain the new package version.

## 2. Additions over changes — ideally zero monorepo changes

The default assumption when starting an experiment is that the existing public API is enough. When it isn't:

- **Prefer additive PRs**: a new injection token, a new `index.ts` re-export, a new injectable implementing an existing token. These are safe for every existing consumer and every prior experiment.
- **Avoid changes or removals** to existing tokens, types, or exported signatures to make an experiment fit.
- If only a non-additive change works, treat it as a signal to design a new extension point rather than modify an existing one.

This additive bias is scoped to experiment-support work — general monorepo refactoring follows its own rules.

**Sequencing**: the additive PR lands in the monorepo, the affected `@lensapp/*` package is released, **then** the experiment bumps its `peerDependencies` and is tagged against a Lens version that contains the new package version. Cutting an experiments tag against a Lens version that predates the supporting PR will fail at runtime.

## 3. Lens version ↔ experiment tag pairing

Lens Desktop and experiments have independent version numbers. They're paired at publish time by the release tag in this repo:

- **Tag format**: `<lensVersion>.<numericSuffix>` (e.g. `2025.12.0.3`).
- **At runtime**, Lens scans this repo's GitHub releases, keeps tags starting with `${appVersion}.`, picks the highest numeric suffix, and fetches that manifest.
- A Lens version with no matching tag → empty catalog, no fallback.

Operational check: the release workflow trigger in this repo must accept that same tag pattern. If CI is still configured for a different trigger, the runtime contract is still `<lensVersion>.<suffix>` and publishing must happen via manual dispatch or after updating the workflow.

Implication: anything you need from the monorepo must already be in the `@lensapp/*` versions bundled into the Lens release that a matching experiments tag will target.
