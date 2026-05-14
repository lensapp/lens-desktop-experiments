import { getAiProviderInstanceFieldBunch, AiProviderInstanceFieldInput } from "@lensapp/ai-provider-instance-contracts";
import type { Azure2ProviderInstance } from "../../ai-provider/ai-provider.injectable";

export const modelIdsFieldBunch = getAiProviderInstanceFieldBunch<Azure2ProviderInstance, "modelIds">(
  {
    id: "azure-2-model-ids",
    key: "modelIds",
    label: "Model IDs (comma-separated)",
    type: "string",
    required: true,
    placeholder: "gpt-4, gpt-35-turbo",
    hint: "Note: Prism uses complex prompts and we recommend using similar to GPT-4.1. Less capable models may not work as expected. The used model needs to support tool calling capabilities.",
    envVar: "LENS_PRISM_AZURE_2_MODEL_IDS",
  },
  AiProviderInstanceFieldInput,
  {
    storageKeyPrefix: "ai-provider-for-azure-2",
    storageKeySegment: "model-ids",
    defaultValue: "",
  },
);
