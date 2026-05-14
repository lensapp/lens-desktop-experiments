import { getInjectable } from "@lensapp/injectable";
import { autorun, toJS } from "mobx";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { customDarkColorsInjectable, customLightColorsInjectable } from "./custom-theme-colors.injectable";
import { customThemeModeInjectable } from "./custom-theme-mode.injectable";
import { savedThemesInjectable } from "./saved-themes.injectable";
import {
  customDarkColorsStorageKey,
  customLightColorsStorageKey,
  customThemeModeStorageKey,
  savedThemesStorageKey,
} from "./storage-keys";

const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled — best-effort persistence
  }
};

const persistOnChangeInjectable = getInjectable({
  id: "theme-tweaker-persist-on-change",
  instantiate: (di) => ({
    run: () => {
      const darkColors = di.inject(customDarkColorsInjectable);
      const lightColors = di.inject(customLightColorsInjectable);
      const mode = di.inject(customThemeModeInjectable);
      const savedThemes = di.inject(savedThemesInjectable);

      autorun(() => writeJson(customDarkColorsStorageKey, Object.fromEntries(darkColors.entries())));
      autorun(() => writeJson(customLightColorsStorageKey, Object.fromEntries(lightColors.entries())));
      autorun(() => {
        try {
          window.localStorage.setItem(customThemeModeStorageKey, mode.get());
        } catch {
          // best-effort
        }
      });
      autorun(() => writeJson(savedThemesStorageKey, toJS(savedThemes)));
    },
  }),
  injectionToken: anytimeAfterApplicationIsLoadedInjectionToken,
  causesSideEffects: true,
});

export default persistOnChangeInjectable;
