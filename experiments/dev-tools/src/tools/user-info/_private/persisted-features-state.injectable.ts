import { getInjectable } from "@lensapp/injectable";
import { getPersistedInjectionToken } from "@lensapp/persisted-state";
import { observable } from "mobx";

export const persistedFeaturesStateInjectable = getInjectable({
  id: "dev-tool-persisted-features-state",

  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(["dev-tools", "user-info", "known-features"], observable.set<string>([], { deep: false }));
  },
});
