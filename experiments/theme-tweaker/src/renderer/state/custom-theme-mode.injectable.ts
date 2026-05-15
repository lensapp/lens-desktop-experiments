import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { getPersistedInjectionToken } from "@lensapp/persisted-state";

export type CustomThemeMode = "dark" | "light";

export const customThemeModePersistedInjectable = getInjectable({
  id: "theme-tweaker-custom-mode-persisted",
  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(["theme-tweaker", "custom-mode"], observable.box<CustomThemeMode>("dark", { deep: false }));
  },
});

export const customThemeModeInjectable = getInjectable({
  id: "theme-tweaker-custom-mode",
  instantiate: (di) => di.inject(customThemeModePersistedInjectable).promise(),
});
