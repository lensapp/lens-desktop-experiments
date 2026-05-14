import { getAiProviderInstanceFieldBunch } from "@lensapp/ai-provider-instance-contracts";
import type { Azure2ProviderInstance } from "../../ai-provider/ai-provider.injectable";
import { BlankTolerantNumberInput } from "./_components/blank-tolerant-number-input";

export const maxOutputTokensFieldBunch = getAiProviderInstanceFieldBunch<Azure2ProviderInstance, "maxOutputTokens">(
  {
    id: "azure-2-max-output-tokens",
    key: "maxOutputTokens",
    label: "Max Output Tokens (optional)",
    type: "number",
    required: false,
    placeholder: "4096",
    hint: "Leave blank to let the model decide. Required to be unset for reasoning models like GPT-5 / o1 / o3.",
    envVar: "LENS_PRISM_AZURE_2_MAX_OUTPUT_TOKENS",
    parseValue: (raw) => (raw.trim() === "" ? (undefined as unknown as number) : Number(raw)),
    formatValue: (value) =>
      value === undefined || value === null || Number.isNaN(value as unknown as number)
        ? ""
        : (value as unknown as number).toString(),
  },
  BlankTolerantNumberInput,
  {
    storageKeyPrefix: "ai-provider-for-azure-2",
    storageKeySegment: "max-output-tokens",
    defaultValue: "",
  },
);
