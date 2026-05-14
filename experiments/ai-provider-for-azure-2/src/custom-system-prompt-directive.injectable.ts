import { getInjectable } from "@lensapp/injectable";
import { aiDirectiveInjectionToken, type AiProviderInstanceId } from "@lensapp/ai-engine-contracts";
import { aiProviderInstanceLifecycle } from "@lensapp/ai-provider-instance-contracts";
import { universalAiChatKind } from "@lensapp/ai-chat-contracts";
import { azure2Specifier } from "./ai-provider/ai-provider.injectable";
import { customSystemPromptFieldBunch } from "./ai-provider-instance/field-bunches/custom-system-prompt-field-bunch.injectable";

export const customSystemPromptDirectiveForAzure2Injectable = getInjectable({
  id: "custom-system-prompt-directive-for-azure-2",

  instantiate: async (di, aiProviderInstanceId: AiProviderInstanceId) => {
    const promptComputed = await di.inject(customSystemPromptFieldBunch.outboundValue, aiProviderInstanceId);

    return {
      orderNumber: 20,
      getContent: () => promptComputed.get(),
    };
  },

  lifecycle: aiProviderInstanceLifecycle,

  injectionToken: aiDirectiveInjectionToken.for(universalAiChatKind).for(azure2Specifier),
});
