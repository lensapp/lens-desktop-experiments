import { getAiProviderInstanceFieldBunch, AiProviderInstanceFieldInput } from "@lensapp/ai-provider-instance-contracts";
import type { Azure2ProviderInstance } from "../../ai-provider/ai-provider.injectable";

export const apiKeyFieldBunch = getAiProviderInstanceFieldBunch<Azure2ProviderInstance, "apiKey">(
  {
    id: "azure-2-api-key",
    key: "apiKey",
    label: "API Key",
    type: "password",
    required: true,
    placeholder: "Your Azure OpenAI API key",
    hint: "Put in your Azure API key to use Lens AI features.",
    envVar: "LENS_PRISM_AZURE_2_API_KEY",
  },
  AiProviderInstanceFieldInput,
  {
    storageKeyPrefix: "ai-provider-for-azure-2",
    storageKeySegment: "api-key",
    defaultValue: "",
  },
);
