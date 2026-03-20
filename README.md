# Lens Desktop Experiments

Dynamic feature experiments for Lens Desktop. Each experiment is a CommonJS bundle loaded at runtime via a sandbox.

## Repository Structure

```
experiments/
  hello-world/        # Sample experiment
  _template/          # Copyable boilerplate for new experiments
infrastructure/
  build/              # Shared esbuild configuration and build scripts
  sign/               # Ed25519 bundle signing utilities
  publish/            # Manifest generation for releases
```

## How It Works

Experiments are CommonJS bundles that export `getFeature()` instances. At runtime, the main Lens Desktop application loads these bundles via a sandbox (`new Function("module", "require", code)`) and registers the features into the DI container.

Each experiment has two entry points:
- `main-entry.ts` - Main process feature (MCP tools, backend logic)
- `renderer-entry.ts` - Renderer process feature (UI listeners, components)

## Adding a New Experiment

1. Copy `experiments/_template/` to `experiments/your-experiment-name/`
2. Update `package.json` with your experiment's metadata
3. Implement your features in `src/main/` and `src/renderer/`
4. Add entry point re-exports in `main-entry.ts` and `renderer-entry.ts`
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