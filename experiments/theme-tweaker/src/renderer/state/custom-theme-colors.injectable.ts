import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { darkThemeDefaults } from "../dark-theme-defaults";
import { customColorsStorageKey } from "./storage-keys";

const readPersisted = (): Record<string, string> => {
  try {
    const raw = window.localStorage.getItem(customColorsStorageKey);

    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (parsed && typeof parsed === "object") {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).filter(
          ([, value]) => typeof value === "string",
        ),
      ) as Record<string, string>;
    }

    return {};
  } catch {
    return {};
  }
};

export const customThemeColorsInjectable = getInjectable({
  id: "theme-tweaker-custom-colors",
  instantiate: () => {
    const seed = { ...darkThemeDefaults, ...readPersisted() };

    return observable.map<string, string>(Object.entries(seed));
  },
});
