# Porting `ai-provider-for-azure-2` back into the monorepo

This experiment was a release-cycle bypass: a copy of the original `ai-provider-for-azure` with a small set of Azure fixes layered on top. Once the experiment graduates, the fixes should land in the original package and this experiment should be deleted.

## Target package in the monorepo

```
js/core/lens-desktop-monorepo/packages/features/prism/ai-providers/ai-provider-for-azure/
```

(There is also a `business-features/.../ai-providers/ai-provider-for-azure/` path that ships only `dist`. The source-of-truth is the `prism` one above.)

## What is genuinely new (port these)

Five new files, ~550 lines total. All are self-contained — drop them in as-is and rename the kind/IDs.

| New file | What it does |
| --- | --- |
| `src/ai-model/_private/retrying-fetch.ts` | Wraps `fetch` with: DNS / transient-network retries, 5xx retries, retry on `403 "Public access is disabled"` (Azure private-endpoint warm-up), and `max_tokens` → `max_completion_tokens` body rewrite for reasoning models. Backoff is `base * 3^(attempt-1)` plus jitter; default `maxAttempts=3`, `baseBackoffMs=500`. |
| `src/ai-model/_private/retrying-fetch.test.ts` | Tests for the above. Uses `asyncFn` (custom lint rule bans `mockResolvedValue` family). |
| `src/ai-provider-instance/field-bunches/_components/blank-tolerant-number-input.tsx` | Number input that treats empty string as `undefined` instead of producing `NaN`. Required so users can clear `maxOutputTokens` / `contextWindowSize` and have the SDK omit the field. |
| `src/ai-provider-instance/field-bunches/_components/checkbox-input.tsx` | Plain checkbox used by the new `forceReasoningTranslation` field. |
| `src/ai-provider-instance/field-bunches/force-reasoning-translation-field-bunch.injectable.ts` | New per-instance toggle that turns on the `max_tokens` → `max_completion_tokens` rewrite in `retrying-fetch`. |

> Note: the original package already has `_shared/input-but-not-awful.injectable.tsx` and `_shared/configured-via-environment-variable.tsx`. Decide whether to keep the experiment's `_components/*` files or fold their behavior into the existing `_shared` components. Folding in is cleaner; the experiment kept them separate only to minimise blast radius.

## What is modified (port these diffs)

Roughly ~11 existing files, ~180 net lines. The diffs are the integration points for the new files above.

### `src/ai-model/ai-model.injectable.ts`
- Read the new `forceReasoningTranslationFieldBunch.outboundValue`.
- Wrap the incoming `hostFetch` with `getRetryingFetch({ upstreamFetch, forceMaxCompletionTokens })` and pass it to `createAzure({ ..., fetch })`.

### `src/ai-model/ai-model-configuration.injectable.ts`
- When `maxOutputTokens` / `contextWindowSize` are blank/`""`/`NaN`, emit `undefined` (so `streamText` omits the field) and `0` for context-window respectively. Add `ai-model-configuration.test.ts` coverage for both blank branches.

### `src/ai-provider-instance/field-bunches/max-output-tokens-field-bunch.injectable.ts`
- Switch input component to `BlankTolerantNumberInput`.
- Update `outboundValue` to return `undefined` on blank.
- Add helper hint text.

### `src/ai-provider-instance/field-bunches/context-window-size-field-bunch.injectable.ts`
- Same treatment as above.

### `src/ai-provider-instance/form-validity.injectable.ts`
- Accept `undefined` as valid for the now-optional numeric fields.

### `src/ai-provider-instance/ping-provider.injectable.ts`
- Wire `retryingFetch` into the ping path so DNS/private-endpoint retries apply to ping too.

### `src/ai-provider/ai-provider.injectable.tsx`
- Register the new `forceReasoningTranslationFieldBunch` in the field list.

### `src/feature.ts`
- Register the new field-bunch injectable.

### Field-bunch ID renames
- Several field-bunch injectables were given Azure-2-specific IDs in the experiment (`"…-for-azure-2"`). When porting, drop the `-2` and keep the original IDs.

## Telemetry

The experiment emits **no telemetry of its own**, and the port doesn't need to add any either. All the high-value events come from the shared `ai-provider-instance-modal` and `ai-connector` layers, which Azure-2 already participates in (via `updateAiProviderInstanceForKindInjectionToken`, `pingAiProviderForKindInjectionToken`, etc.):

- `prism / provider-instance-modal-open` / `-close`
- `prism / provider-instance-created` / `-updated` / `-save-failed`
- `prism / ping-provider`
- `integrations / <kind>-providers-table-expand` and `add-<kind>-provider-instance`

These fire automatically once Azure-2 ships as a kind in the monorepo — no work needed at port time. The other monorepo providers (`-azure`, `-anthropic`, `-open-ai`, `-lens-gpt`) emit nothing extra either; only `-open-ai-compatible` adds one provider-specific event because base URL is its unique knob, and Azure-2 has no equivalent unique-knob signal we need to call out.

## What to discard (do NOT port)

- `azure2Specifier` and every `…-for-azure-2` ID rename — these only existed so the experiment could coexist with the real provider at runtime.
- `index.ts` / `package.json` / `tsconfig.json` / `dist/` — experiment packaging only.
- `src/ai-provider.test.tsx`, `src/ai-provider-instance/ping-provider.injectable.test.ts` — the original package's equivalents already exist; only port the *added test cases* (blank-tolerant numerics, retrying-fetch behavior, force-reasoning toggle).

## Step-by-step

1. Branch off `lens-desktop-monorepo`'s `main`.
2. Copy in the 5 new files, replacing `azure2Specifier` with `azureSpecifier` and dropping `-for-azure-2` ID suffixes.
3. Apply the modifications listed above to the 11 existing files.
4. Register the new field-bunch in `feature.ts` and the provider injectable.
5. Extend the existing `ai-model-configuration.test.ts`, `ping-provider.injectable.test.ts`, and `ai-provider.test.tsx` with the new cases.
6. Run `npm run lint`, `npm test` for the package.
7. Manual smoke test: configure an Azure instance, blank out `maxOutputTokens`, enable `forceReasoningTranslation`, ping, then run a chat against a reasoning deployment that requires `max_completion_tokens`.
8. Once landed and shipped, delete `experiments/ai-provider-for-azure-2/` from this repo.

## Estimated effort

~30 minutes of mechanical work plus tests. Low risk — no external API surface changes; all additions are isolated to this package.

## Reference: file-level differences

To regenerate the diff between the two trees:

```
diff -rq \
  /Users/skoncar/dev/projects/lensapp/js/core/lens-desktop-monorepo/packages/features/prism/ai-providers/ai-provider-for-azure/src \
  /Users/skoncar/dev/projects/lensapp/js/core/lens-desktop-experiments/experiments/ai-provider-for-azure-2/src
```
