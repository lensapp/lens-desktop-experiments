# Build, Dev Loop, and Publishing

## What The Build Treats As External (NOT Bundled)

`infrastructure/build/esbuild.config.ts` marks these as external; the bundle imports them from the host DI container's module graph at load time:

```
node:* builtins, @k8slens/*, @lensapp/*, mobx, zod, electron, react, react-dom
```

Anything else you import **will be bundled into `dist/index.js`**. Keep bundles small — prefer host-provided packages over re-implementing. Both host scopes must stay external: bundling a copy of `@k8slens/injectable` would give the experiment its own DI container and break injection-token identity with the host.

## Commands

```bash
# Install — requires GitHub Packages auth for the @lensapp scope (@k8slens comes from npmjs)
npm install

# Build
npm run build                                # all experiments (or CHANNEL=prod npm run build to filter)
npm run build:experiment -- <experiment-id>  # single (channel ignored)

# Verify
npm run typecheck                            # tsc --noEmit per experiment
npm test                                     # jest across experiments/*/src/**/*.test.(ts|tsx)

# Publishing prep (normally only run by CI)
npm run generate-package-json                # writes dist/package.json per experiment
npm run sign                                 # requires EXPERIMENT_SIGNING_PRIVATE_KEY
npm run manifest                             # writes dist/manifest.json
```

Tests use `jest-fixed-jsdom` + `@k8slens/package-build/transformer`, scoped by `testMatch: ["**/experiments/*/src/**/*.test.{ts,tsx}"]`.

## The @lensapp → @k8slens Resolution Bridge (Temporary)

`jest.config.js` (`moduleNameMapper`) and `tsconfig.base.json` (`compilerOptions.paths`) both redirect a handful of `@lensapp/*` specifiers to their `@k8slens/*` counterparts, from one shared list per file:

```
composable-responsibilities, element-components, feature-core, fp,
injectable, injectable-extension-for-mobx, injectable-react
```

Why: the monorepo renamed these packages and published them under `@k8slens`, but has **not** yet republished the `@lensapp/*` packages that depend on them — the versions on GitHub Packages still `require("@lensapp/injectable")`. Without the redirect, a local install ends up with two copies of the DI machinery: `tsc` reports the two `Injectable` types as incompatible, and jest registers every injectable twice.

The bridge is dev-tooling only. It does not touch what is published, and the built bundle is unaffected — both scopes are external there.

**Remove it** (all three places: the two config lists and this section) once the `@lensapp/*` packages are republished from the migrated monorepo. Until then, three `dev-tools` popover interaction tests fail: `@lensapp/button` and friends are prebuilt against `element-components@3.3.1`, which dropped two features and moved to injectable2 in `3.4.0`, so the mixed pair does not render a working popover in jsdom. That mix only exists locally — a Lens release ships one consistent set.

## Local Dev Loop In Lens Desktop

To try an experiment in a running Lens Desktop before publishing:

1. `npm run build:experiment -- <id>` (and `npm run generate-package-json` if you haven't, so `dist/package.json` exists).
2. In Lens Desktop → **Preferences → Extensions → "Install from filesystem"** → select `experiments/<id>/dist/package.json`.
3. Lens installs it as a local extension and starts hot-feature-replacement, so subsequent rebuilds reload the experiment live.

This path bypasses signing / manifest / catalog — it does not validate the signed-catalog flow. Re-test through the catalog with a real release tag before shipping.

### A Filesystem Install Is Not Granted The Internal Tier

Every experiment here imports at least one internal-tier package (`status-bar`, `application`, `cluster-source`, `telemetry`, …). That tier is granted per install, and the host registers only two grants: the signed catalog's verified install, keyed on the exact verified `package.json` path (`lab-experiment-catalog`), and `@lensapp/dev-tools` by manifest name, which is `development-only` (`extension-development/src/development-only/dev-tools-internal-tier-grant.injectable.ts`). A filesystem install is neither, so the first internal import is refused:

> Tried to import "@lensapp/status-bar", which is not available. Rebuild the extension against the extension APIs of this Lens version

The refusal reads identically for an internal package and for one that does not exist — deliberately, so a refusal cannot enumerate what is inside Lens — so the message never names the tier as the cause. `dev-tools` is the exception that installs, because its manifest carries the granted name.

Until the host grants the tier to a local experiment install, borrow the dev-tools grant for one experiment at a time:

1. `npm run build:experiment -- <id> && npm run generate-package-json`
2. In `experiments/<id>/dist/package.json` — generated and gitignored — set `"name": "@lensapp/dev-tools"`
3. Launch a development build, or `DEVELOPMENT=1 /path/to/Lens` for a production binary; the grant is dropped otherwise
4. Install that `dist/package.json`, and uninstall the real dev-tools first — the two collide by name

The forged name works only because that grant is `development-only`; it buys nothing against a shipped build.

The lasting fix is additive and belongs in the monorepo: an `asInternalExtensionDependencyGrantForDevelopmentOnly` beside the dev-tools grant, keyed on the `experiment` manifest block rather than one hard-coded name.

## Publishing

Tag the repo `<lensVersion>.<numericSuffix>` (e.g. `2025.12.0.3`). The Lens Desktop client requires this exact shape — a `v` prefix or anything else will not be discoverable by clients.

**Automatic path (default):** the lens-desktop-monorepo release pipeline sends a `repository_dispatch` event (`lens-release-published`, payload `{ lensVersion }`) after each Lens Desktop release. `.github/workflows/auto-release.yml` receives it, computes the next tag suffix for that Lens version, pushes the tag, and dispatches `release.yml` on the tag ref. The channel is derived from the version suffix: `-internal` → `dev`, everything else → `prod`.

**Backfill path:** after merging an experiment change that should reach users on already-released Lens versions, trigger `.github/workflows/backfill-releases.yml`. It dispatches `auto-release.yml` for every Lens version whose pointer tag falls within `since-days` (default 90), skipping versions already released from current HEAD. Supports `dry-run`.

**Manual path:** push the tag, then trigger `.github/workflows/release.yml` via `workflow_dispatch` with two inputs:

- `tag` — the pushed tag (also used as the ref when dispatching, so OIDC trust accepts the run).
- `channel` — `prod` or `dev`. Only experiments whose `experiment.channels` array contains the chosen channel are built, signed, and included in the manifest.

Bare tag pushes do **not** publish. An explicit channel per release (chosen manually or derived from the Lens version) prevents accidentally shipping an in-progress experiment to `prod`.

`release.yml` builds, signs, and generates the manifest, then publishes to two destinations, each with its own pointer file:

- **S3 (primary):**
  - Artifacts: `s3://lens-labs-experiments-prod/releases/<tag>/` (immutable, cached forever).
  - Pointer: `s3://lens-labs-experiments-prod/latest/<lensVersion>.json` (5-min cache, contains `{ tag, publishedAt }`).
  - Served via CloudFront in the LensLabs AWS account. New Lens Desktop clients fetch from here.
- **GitHub Releases (fallback):**
  - Canonical release for the tag with all artifacts attached. Human-browsable; clients fall back to this if S3/CloudFront is unreachable.
  - Floating pointer release named `latest-<lensVersion>`, marked prerelease, with a single `pointer.json` asset. Same shape as the S3 pointer. Reachable at `https://github.com/lensapp/lens-desktop-experiments/releases/download/latest-<lensVersion>/pointer.json` — predictable URL, no API call required. The release + tag are created once per Lens version; subsequent publishes only replace the `pointer.json` asset (`gh release upload --clobber`), so the tag itself never moves.
  - The whole GitHub side will be dropped in a follow-up PR once the S3 path has been proven over a couple of release cycles.

S3 uploads use GitHub OIDC to assume the `experiments-publisher` IAM role. The trust policy only accepts runs with a tag ref (`ref:refs/tags/*`), so PR builds and feature branches cannot publish — even if compromised. Dispatching from a branch (e.g. `main`) will run but fail at the AWS credentials step.
