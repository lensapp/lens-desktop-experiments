import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { getPersistedInjectionToken } from "@lensapp/persisted-state";
import { darkThemeDefaults } from "../dark-theme-defaults";
import { lightThemeDefaults } from "../light-theme-defaults";

export const customDarkBaselinePersistedInjectable = getInjectable({
  id: "theme-tweaker-custom-dark-baseline-persisted",
  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(
      ["theme-tweaker", "custom-dark-baseline"],
      observable.map<string, string>(Object.entries(darkThemeDefaults), { deep: false }),
    );
  },
});

export const customLightBaselinePersistedInjectable = getInjectable({
  id: "theme-tweaker-custom-light-baseline-persisted",
  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(
      ["theme-tweaker", "custom-light-baseline"],
      observable.map<string, string>(Object.entries(lightThemeDefaults), { deep: false }),
    );
  },
});

export const customDarkBaselineInjectable = getInjectable({
  id: "theme-tweaker-custom-dark-baseline",
  instantiate: (di) => di.inject(customDarkBaselinePersistedInjectable).promise(),
});

export const customLightBaselineInjectable = getInjectable({
  id: "theme-tweaker-custom-light-baseline",
  instantiate: (di) => di.inject(customLightBaselinePersistedInjectable).promise(),
});
