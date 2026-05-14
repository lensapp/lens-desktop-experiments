import { getAiProviderInstanceFieldBunch } from "@lensapp/ai-provider-instance-contracts";
import type { Azure2ProviderInstance } from "../../ai-provider/ai-provider.injectable";
import { CheckboxInput } from "./_components/checkbox-input";

export const forceReasoningTranslationFieldBunch = getAiProviderInstanceFieldBunch<
  Azure2ProviderInstance,
  "forceReasoningTranslation"
>(
  {
    id: "azure-2-force-reasoning-translation",
    key: "forceReasoningTranslation",
    label: "Force max_completion_tokens (reasoning models)",
    type: "string",
    required: false,
    hint: "Enable for reasoning-style Azure deployments (GPT-5, o1, o3, o4-mini) named with a non-standard deployment name. Rewrites outgoing 'max_tokens' to 'max_completion_tokens' so the deployment accepts the request.",
    envVar: "LENS_PRISM_AZURE_2_FORCE_REASONING_TRANSLATION",
  },
  CheckboxInput,
  {
    storageKeyPrefix: "ai-provider-for-azure-2",
    storageKeySegment: "force-reasoning-translation",
    defaultValue: "",
  },
);
