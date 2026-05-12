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

Tag the repo `<lensVersion>.<numericSuffix>` (e.g. `2025.12.0.3`). The workflow trigger filter and the Lens Desktop client both require this exact shape — a `v` prefix or anything else will neither trigger CI nor be discoverable by clients.

`.github/workflows/release.yml` builds, signs, and generates the manifest, then publishes to two destinations, each with its own pointer file:

- **S3 (primary):**
  - Artifacts: `s3://lens-labs-experiments-prod/releases/<tag>/` (immutable, cached forever).
  - Pointer: `s3://lens-labs-experiments-prod/latest/<lensVersion>.json` (5-min cache, contains `{ tag, publishedAt }`).
  - Served via CloudFront in the LensLabs AWS account. New Lens Desktop clients fetch from here.
- **GitHub Releases (fallback):**
  - Canonical release for the tag with all artifacts attached. Human-browsable; clients fall back to this if S3/CloudFront is unreachable.
  - Floating pointer release named `latest-<lensVersion>`, marked prerelease, with a single `pointer.json` asset. Same shape as the S3 pointer. Reachable at `https://github.com/lensapp/lens-desktop-experiments/releases/download/latest-<lensVersion>/pointer.json` — predictable URL, no API call required. The release + tag are created once per Lens version; subsequent publishes only replace the `pointer.json` asset (`gh release upload --clobber`), so the tag itself never moves.
  - The whole GitHub side will be dropped in a follow-up PR once the S3 path has been proven over a couple of release cycles.

S3 uploads use GitHub OIDC to assume the `experiments-publisher` IAM role. The trust policy only accepts tag-push runs (`ref:refs/tags/*`), so PR builds and feature branches cannot publish — even if compromised.

**Manual re-publish.** Trigger via `workflow_dispatch` with the tag as the ref (not the branch). Dispatching from a branch (e.g. `main`) will run but fail at the AWS credentials step because the role trust requires a tag ref.
