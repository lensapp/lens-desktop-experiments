import { getAiProviderInstanceFieldBunch, AiProviderInstanceFieldInput } from "@lensapp/ai-provider-instance-contracts";
import type { Azure2ProviderInstance } from "../../ai-provider/ai-provider.injectable";

export const resourceNameFieldBunch = getAiProviderInstanceFieldBunch<Azure2ProviderInstance, "resourceName">(
  {
    id: "azure-2-resource-name",
    key: "resourceName",
    label: "Resource Name",
    type: "string",
    required: true,
    placeholder: "my-azure-openai-resource",
    envVar: "LENS_PRISM_AZURE_2_RESOURCE_NAME",
  },
  AiProviderInstanceFieldInput,
  {
    storageKeyPrefix: "ai-provider-for-azure-2",
    storageKeySegment: "resource-name",
    defaultValue: "",
  },
);
