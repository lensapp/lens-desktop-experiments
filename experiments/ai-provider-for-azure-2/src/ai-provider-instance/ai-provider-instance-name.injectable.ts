import { getInjectable } from "@lensapp/injectable";
import { aiProviderInstanceNameInjectionToken } from "@lensapp/ai-provider-instance-contracts";
import type { AiProviderInstanceId } from "@lensapp/ai-engine-contracts";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { azure2ProviderNameStateInjectable } from "./provider-name-state.injectable";
import { asReactive } from "@lensapp/utilities";

export const aiProviderInstanceNameForAzure2Injectable = getInjectable({
  id: "ai-provider-instance-name-for-azure-2",

  instantiate: (di) => (aiProviderInstanceId: AiProviderInstanceId) => {
    const nameReactive = asReactive(di.inject(azure2ProviderNameStateInjectable, aiProviderInstanceId));

    return nameReactive.get()?.get() ?? "Azure (Lab)";
  },

  injectionToken: aiProviderInstanceNameInjectionToken.for(azure2Specifier),
});
