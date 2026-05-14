import { getInjectable } from "@lensapp/injectable";
import { runInAction } from "mobx";
import { removeAiProviderInstanceForKindInjectionToken } from "@lensapp/ai-provider-instance-contracts";
import type { AiProviderInstanceId } from "@lensapp/ai-provider-instance-contracts";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { azure2ProviderIdsPersistedInjectable } from "./provider-ids.injectable";

export const removeAzure2ProviderInstanceInjectable = getInjectable({
  id: "remove-azure-2-provider-instance",

  instantiate: async (di) => {
    const providerIds = await di.inject(azure2ProviderIdsPersistedInjectable).promise();

    return (aiProviderInstanceId: AiProviderInstanceId) => {
      runInAction(() => {
        providerIds.remove(aiProviderInstanceId);
      });
    };
  },

  injectionToken: removeAiProviderInstanceForKindInjectionToken.for(azure2Specifier),
});
