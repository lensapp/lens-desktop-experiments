import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { darkThemeDefaults } from "../dark-theme-defaults";
import { lightThemeDefaults } from "../light-theme-defaults";
import { customDarkColorsStorageKey, customLightColorsStorageKey } from "./storage-keys";

const readPersisted = (storageKey: string): Record<string, string> => {
  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (parsed && typeof parsed === "object") {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).filter(([, value]) => typeof value === "string"),
      ) as Record<string, string>;
    }

    return {};
  } catch {
    return {};
  }
};

export const customDarkColorsInjectable = getInjectable({
  id: "theme-tweaker-custom-dark-colors",
  instantiate: () => {
    const seed = { ...darkThemeDefaults, ...readPersisted(customDarkColorsStorageKey) };

    return observable.map<string, string>(Object.entries(seed));
  },
});

export const customLightColorsInjectable = getInjectable({
  id: "theme-tweaker-custom-light-colors",
  instantiate: () => {
    const seed = { ...lightThemeDefaults, ...readPersisted(customLightColorsStorageKey) };

    return observable.map<string, string>(Object.entries(seed));
  },
});
