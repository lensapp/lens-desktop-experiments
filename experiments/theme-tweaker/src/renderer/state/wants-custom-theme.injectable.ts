import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { getPersistedInjectionToken } from "@lensapp/persisted-state";

export const wantsCustomThemePersistedInjectable = getInjectable({
  id: "theme-tweaker-wants-custom-theme-persisted",
  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(["theme-tweaker", "wants-custom-theme"], observable.box<boolean>(false, { deep: false }));
  },
});

export const wantsCustomThemeInjectable = getInjectable({
  id: "theme-tweaker-wants-custom-theme",
  instantiate: (di) => di.inject(wantsCustomThemePersistedInjectable).promise(),
});
