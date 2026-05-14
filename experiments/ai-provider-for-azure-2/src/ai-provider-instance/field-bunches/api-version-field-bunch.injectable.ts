import { getAiProviderInstanceFieldBunch, AiProviderInstanceFieldInput } from "@lensapp/ai-provider-instance-contracts";
import type { Azure2ProviderInstance } from "../../ai-provider/ai-provider.injectable";

export const apiVersionFieldBunch = getAiProviderInstanceFieldBunch<Azure2ProviderInstance, "apiVersion">(
  {
    id: "azure-2-api-version",
    key: "apiVersion",
    label: "API Version (optional)",
    type: "string",
    required: false,
    placeholder: "2024-02-01",
    envVar: "LENS_PRISM_AZURE_2_API_VERSION",
  },
  AiProviderInstanceFieldInput,
  {
    storageKeyPrefix: "ai-provider-for-azure-2",
    storageKeySegment: "api-version",
    defaultValue: "",
  },
);
