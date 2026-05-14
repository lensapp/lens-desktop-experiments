import { getAiProviderInstanceFieldBunch, AiProviderInstanceFieldInput } from "@lensapp/ai-provider-instance-contracts";
import type { Azure2ProviderInstance } from "../../ai-provider/ai-provider.injectable";

export const customSystemPromptFieldBunch = getAiProviderInstanceFieldBunch<
  Azure2ProviderInstance,
  "customSystemPrompt"
>(
  {
    id: "azure-2-custom-system-prompt",
    key: "customSystemPrompt",
    label: "Custom System Prompt (optional)",
    type: "textarea",
    required: false,
    placeholder: "You are a helpful assistant...",
    hint: "These instructions are appended to every prompt as a guidance to personalize and improve Lens Prism responses.",
    envVar: "LENS_PRISM_AZURE_2_CUSTOM_SYSTEM_PROMPT",
  },
  AiProviderInstanceFieldInput,
  {
    storageKeyPrefix: "ai-provider-for-azure-2",
    storageKeySegment: "custom-system-prompt",
    defaultValue: "",
  },
);
