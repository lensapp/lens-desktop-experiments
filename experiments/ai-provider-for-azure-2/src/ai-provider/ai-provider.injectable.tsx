import { aiProviderInjectionToken, getAiProviderKind } from "@lensapp/ai-engine-contracts";
import { getInjectable } from "@lensapp/injectable";
import type { AiProviderInstance } from "@lensapp/ai-provider-instance-contracts";

export interface Azure2ProviderInstance extends AiProviderInstance {
  aiProviderKind: typeof azure2Specifier;
  apiKey: string;
  resourceName: string;
  modelIds: string;
  apiVersion?: string;
  contextWindowSize?: number;
  maxOutputTokens?: number;
  customSystemPrompt?: string;
  forceReasoningTranslation?: string;
}

export const azure2Specifier = getAiProviderKind<Azure2ProviderInstance>()("azure2");

export const aiProviderInjectable = getInjectable({
  id: "ai-provider-for-azure-2",

  instantiate: (_di) => ({
    kind: azure2Specifier,
    priority: 4,
  }),

  injectionToken: aiProviderInjectionToken,
});
