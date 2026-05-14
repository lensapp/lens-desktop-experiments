import { getInjectable } from "@lensapp/injectable";
import { autorun, toJS } from "mobx";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { customThemeColorsInjectable } from "./custom-theme-colors.injectable";
import { savedThemesInjectable } from "./saved-themes.injectable";
import { customColorsStorageKey, savedThemesStorageKey } from "./storage-keys";

const persistOnChangeInjectable = getInjectable({
  id: "theme-tweaker-persist-on-change",
  instantiate: (di) => ({
    run: () => {
      const colorsState = di.inject(customThemeColorsInjectable);
      const savedThemes = di.inject(savedThemesInjectable);

      autorun(() => {
        const snapshot = Object.fromEntries(colorsState.entries());

        try {
          window.localStorage.setItem(customColorsStorageKey, JSON.stringify(snapshot));
        } catch {
          // Storage may be full or disabled — best-effort persistence
        }
      });

      autorun(() => {
        const snapshot = toJS(savedThemes);

        try {
          window.localStorage.setItem(savedThemesStorageKey, JSON.stringify(snapshot));
        } catch {
          // Storage may be full or disabled — best-effort persistence
        }
      });
    },
  }),
  injectionToken: anytimeAfterApplicationIsLoadedInjectionToken,
  causesSideEffects: true,
});

export default persistOnChangeInjectable;
