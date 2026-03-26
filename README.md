# Lens Desktop Experiments

Dynamic feature experiments for Lens Desktop. Each experiment is a renderer-only CommonJS bundle loaded at runtime via a sandbox.

## Repository Structure

```
experiments/
  hello-world/        # Sample experiment
infrastructure/
  build/              # Shared esbuild configuration and build scripts
  sign/               # Ed25519 bundle signing utilities
  publish/            # Manifest generation for releases
```

## How It Works

Experiments are renderer-only CommonJS bundles that export `getFeature()` instances. At runtime, Lens Desktop loads these bundles via a sandbox (`new Function("module", "require", code)`) and registers the features into the DI container.

Each experiment has a single entry point:
- `index.ts` - Re-exports the renderer feature, built to `dist/index.js`

## Adding a New Experiment

1. Create a new directory under `experiments/your-experiment-name/`
2. Add a `package.json` with experiment metadata (see below)
3. Add an `index.ts` that re-exports your feature
4. Implement your feature in `src/renderer/feature.ts` with glob-imported injectables
5. Run `npm run build` to verify the build

## Development

```bash
# Install dependencies (requires GitHub Packages auth for @lensapp scope)
npm install

# Build all experiments
npm run build

# Build a single experiment
npm run build:experiment -- hello-world

# Type-check all experiments
npm run typecheck

# Run tests
npm test

# Sign bundles (requires EXPERIMENT_SIGNING_PRIVATE_KEY env var)
npm run sign

# Generate release manifest
npm run manifest
```

## Experiment Metadata

Each experiment's `package.json` includes an `experiment` field:

```json
{
  "experiment": {
    "id": "my-experiment",
    "name": "My Experiment",
    "description": "What this experiment does",
    "terminationUtcDateTime": "2027-01-01T00:00:00Z"
  }
}
```

The `terminationUtcDateTime` field defines when the experiment expires and should be removed.
