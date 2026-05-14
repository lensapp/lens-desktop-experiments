import { getInjectable } from "@lensapp/injectable";
import { computed } from "mobx";
import { aiProviderInstanceListForKindInjectionToken } from "@lensapp/ai-provider-instance-contracts";
import type { AiProviderInstance } from "@lensapp/ai-provider-instance-contracts";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { azure2ProviderIdsStateInjectable } from "./provider-ids.injectable";

export const azure2InstanceListInjectable = getInjectable({
  id: "azure-2-instance-list",

  instantiate: async (di) => {
    const providerIds = await di.inject(azure2ProviderIdsStateInjectable);

    return computed((): AiProviderInstance[] => {
      return [...providerIds].map((id) => ({
        id,
        aiProviderKind: azure2Specifier,
      }));
    });
  },

  injectionToken: aiProviderInstanceListForKindInjectionToken.for(azure2Specifier),
});
