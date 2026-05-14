import { getAiProviderInstanceFieldBunch } from "@lensapp/ai-provider-instance-contracts";
import type { Azure2ProviderInstance } from "../../ai-provider/ai-provider.injectable";
import { BlankTolerantNumberInput } from "./_components/blank-tolerant-number-input";

export const contextWindowSizeFieldBunch = getAiProviderInstanceFieldBunch<Azure2ProviderInstance, "contextWindowSize">(
  {
    id: "azure-2-context-window-size",
    key: "contextWindowSize",
    label: "Context Window Size (optional)",
    type: "number",
    required: false,
    placeholder: "128000",
    envVar: "LENS_PRISM_AZURE_2_CONTEXT_WINDOW",
    parseValue: (raw) => (raw.trim() === "" ? (undefined as unknown as number) : Number(raw)),
    formatValue: (value) =>
      value === undefined || value === null || Number.isNaN(value as unknown as number)
        ? ""
        : (value as unknown as number).toString(),
  },
  BlankTolerantNumberInput,
  {
    storageKeyPrefix: "ai-provider-for-azure-2",
    storageKeySegment: "context-window-size",
    defaultValue: "",
  },
);
