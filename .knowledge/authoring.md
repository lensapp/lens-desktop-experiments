# Authoring Experiments

Read [starting-a-new-experiment.md](./starting-a-new-experiment.md) first when beginning from a fresh user request.

Everything needed to physically lay out and fill in a new experiment.

## Reference Implementations

Always read one of these before creating a new experiment:

| Experiment | Shape | Use As Template When |
|------------|-------|----------------------|
| `experiments/hello-world/` | Minimal single-feature experiment with one injectable | Adding a small, self-contained experiment |
| `experiments/dev-tools/` | Larger experiment exporting multiple features (tools + in-general) | Experiment spans several tools / subdomains |

Template guidance:

- Use `hello-world/` as the authoritative template for `package.json` shape and dependency placement.
- Use `dev-tools/` for multi-feature layout, feature composition, and larger experiment structure.
- Do **not** copy `dev-tools/package.json` verbatim when creating a new experiment; follow the dependency rules below instead.

## Directory Layout

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

## `index.ts`

Re-export file only, no logic:

```ts
// experiments/hello-world/index.ts
export { helloWorldRendererFeature } from "./src/renderer/feature";
```

Multiple features are fine (see `dev-tools/index.ts`).

## `feature.ts`

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

## `package.json`

Required structure (see `experiments/hello-world/package.json` for a complete example):

1. `"experiment"` block with `id`, `name`, `description`, `terminationUtcDateTime` (ISO 8601 UTC). Every experiment must declare a termination date — beyond it, the experiment is expected to be removed (graduated into the monorepo or deleted).
2. `"main": "./dist/index.js"` and matching `exports`.
3. Every `@lensapp/*` / framework package the feature consumes at runtime listed in **both** `peerDependencies` and `devDependencies`.

## Injectables

Standard monorepo DI conventions apply: `getInjectable`, injection tokens for public contracts, `_private/` for internals. Experiments are DI-registered exactly like in-monorepo features — the only difference is the delivery mechanism. See `../../lens-desktop-monorepo/.knowledge/technical/di/` if you need a refresher.

## New Experiment Checklist

Run through this before opening a PR for a new experiment.

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
