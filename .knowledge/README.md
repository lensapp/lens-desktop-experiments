# Knowledge Base

Agent-oriented knowledge for working on Lens Desktop experiments. Experiment-specific authoring, rules, cross-repo contracts, and build/publishing live here.

General Lens conventions — architecture, DI, MobX, React, testing, commit format — apply when writing experiment code and live in the monorepo's `../../lens-desktop-monorepo/.knowledge/technical/`. From inside the code, an experiment should feel like ordinary Lens feature work; only packaging, boundary, and publishing concerns are experiment-specific. See [AGENTS.md](../AGENTS.md) for routing.

## Files

| File | Purpose |
|------|---------|
| [starting-a-new-experiment.md](./starting-a-new-experiment.md) | Entry-point playbook: understand the request, inspect public APIs, decide whether monorepo support is needed, then author and verify |
| [authoring.md](./authoring.md) | Per-experiment directory layout, `feature.ts`, `package.json`, injectables, new-experiment checklist |
| [rules.md](./rules.md) | The three experiment-specific rules: monorepo-as-third-party, additions-over-changes, version pairing |
| [cross-repo.md](./cross-repo.md) | Contract surface shared with the monorepo and how to rotate the signing key |
| [build.md](./build.md) | Build externals, commands, the local dev loop inside Lens Desktop, and publishing |
