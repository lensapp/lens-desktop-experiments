import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { getPersistedInjectionToken } from "@lensapp/persisted-state";
import type { AiProviderInstanceId } from "@lensapp/ai-engine-contracts";

export const azure2ProviderIdsPersistedInjectable = getInjectable({
  id: "azure-2-provider-ids-persisted",

  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(
      ["ai-provider-for-azure-2", "provider-ids"],
      observable.array<AiProviderInstanceId>([], { deep: false }),
    );
  },
});

export const azure2ProviderIdsStateInjectable = getInjectable({
  id: "azure-2-provider-ids-state",

  instantiate: (di) => di.inject(azure2ProviderIdsPersistedInjectable).promise(),
});
