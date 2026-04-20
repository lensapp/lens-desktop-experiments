# Cross-Repo Contract Surface

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

## Key rotation

Rotating the signing keypair is a coordinated cross-repo ship:

1. Generate a new keypair (`infrastructure/sign/generate-keypair.ts`).
2. Update the `EXPERIMENT_SIGNING_PRIVATE_KEY` secret in this repo.
3. Update the PEM constant in `publicKeyInjectable` in the monorepo.
4. Release the monorepo; only then cut the next experiments tag signed with the new key. Until the new monorepo release is live, clients on the old public key will reject the new signatures.
