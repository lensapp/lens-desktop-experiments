# Build, Dev Loop, and Publishing

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

Tag the repo `<lensVersion>.<numericSuffix>` (e.g. `2025.12.0.3`). Lens clients look for that exact tag pattern at runtime.

Before relying on push-tag automation, verify that `.github/workflows/release.yml` is configured for the same tag pattern. If the workflow is still triggered by some other convention, use manual dispatch with the exact `<lensVersion>.<numericSuffix>` tag or update the workflow first. The consumer in Lens Desktop does **not** understand a `v` prefix.
