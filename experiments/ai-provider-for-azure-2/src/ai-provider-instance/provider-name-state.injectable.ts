import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { aiProviderInstanceLifecycle } from "@lensapp/ai-provider-instance-contracts";
import { getPersistedInjectionToken } from "@lensapp/persisted-state";

export const azure2ProviderNamePersistedInjectable = getInjectable({
  id: "azure-2-provider-name-persisted",

  instantiate: (di, aiProviderInstanceId) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(
      ["ai-provider-for-azure-2", aiProviderInstanceId, "name"],
      observable.box("Azure (Lab)", { deep: false }),
    );
  },

  lifecycle: aiProviderInstanceLifecycle,
});

export const azure2ProviderNameStateInjectable = getInjectable({
  id: "azure-2-provider-name-state",

  instantiate: (di, aiProviderInstanceId) =>
    di.inject(azure2ProviderNamePersistedInjectable, aiProviderInstanceId).promise(),

  lifecycle: aiProviderInstanceLifecycle,
});
