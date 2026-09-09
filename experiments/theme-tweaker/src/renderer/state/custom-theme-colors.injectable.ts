import { getInjectable } from "@k8slens/injectable";
import { observable } from "mobx";
import { getPersistedInjectionToken } from "@lensapp/persisted-state";
import { darkThemeDefaults } from "../dark-theme-defaults";
import { lightThemeDefaults } from "../light-theme-defaults";

export const customDarkColorsPersistedInjectable = getInjectable({
  id: "theme-tweaker-custom-dark-colors-persisted",
  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(
      ["theme-tweaker", "custom-dark-colors"],
      observable.map<string, string>(Object.entries(darkThemeDefaults), { deep: false }),
    );
  },
});

export const customLightColorsPersistedInjectable = getInjectable({
  id: "theme-tweaker-custom-light-colors-persisted",
  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(
      ["theme-tweaker", "custom-light-colors"],
      observable.map<string, string>(Object.entries(lightThemeDefaults), { deep: false }),
    );
  },
});

export const customDarkColorsInjectable = getInjectable({
  id: "theme-tweaker-custom-dark-colors",
  instantiate: (di) => di.inject(customDarkColorsPersistedInjectable).promise(),
});

export const customLightColorsInjectable = getInjectable({
  id: "theme-tweaker-custom-light-colors",
  instantiate: (di) => di.inject(customLightColorsPersistedInjectable).promise(),
});
