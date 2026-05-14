import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { customThemeModeStorageKey } from "./storage-keys";

export type CustomThemeMode = "dark" | "light";

const readPersistedMode = (): CustomThemeMode => {
  try {
    const raw = window.localStorage.getItem(customThemeModeStorageKey);

    return raw === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export const customThemeModeInjectable = getInjectable({
  id: "theme-tweaker-custom-mode",
  instantiate: () => observable.box<CustomThemeMode>(readPersistedMode()),
});
