import { getInjectable } from "@lensapp/injectable";
import { reaction } from "mobx";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { activeThemeInjectable } from "@lensapp/theme-renderer";
import { customDarkColorsInjectable, customLightColorsInjectable } from "./state/custom-theme-colors.injectable";
import { customThemeModeInjectable } from "./state/custom-theme-mode.injectable";
import { customThemeId } from "./themes/custom-theme-id";
import { darkThemeDefaults } from "./dark-theme-defaults";

const colorNames = Object.keys(darkThemeDefaults);

// Workaround: @lensapp/theme-renderer's apply-lens-theme reaction is wired as
// `reaction(() => activeTheme.get(), applyLensTheme)` — its data-fn only tracks the
// theme reference, and applyLensTheme reads `theme.colors` outside any MobX tracking
// context. The Custom theme keeps a stable reference across mode toggles and color
// edits, so the host never repaints on its own. This injectable mirrors the host's
// behavior (CSS variable writes + theme-light body class) for the Custom theme,
// fired by a reaction that explicitly tracks per-key reads.
const applyCustomColorsOnChangeInjectable = getInjectable({
  id: "theme-tweaker-apply-custom-colors-on-change",
  instantiate: (di) => ({
    run: async () => {
      const activeTheme = di.inject(activeThemeInjectable);
      const mode = await di.inject(customThemeModeInjectable);
      const darkColors = await di.inject(customDarkColorsInjectable);
      const lightColors = await di.inject(customLightColorsInjectable);

      let previousValues: ReadonlyArray<string> | undefined;
      let previousMode: "dark" | "light" | undefined;

      reaction(
        () => {
          if (activeTheme.get().id !== customThemeId) {
            return null;
          }

          const currentMode = mode.get();
          const activeMap = currentMode === "light" ? lightColors : darkColors;
          const values = colorNames.map((k) => activeMap.get(k) ?? "");

          return { mode: currentMode, values };
        },
        (snapshot) => {
          if (!snapshot) {
            previousValues = undefined;
            previousMode = undefined;

            return;
          }

          if (previousMode !== snapshot.mode) {
            document.body.classList.toggle("theme-light", snapshot.mode === "light");
            previousMode = snapshot.mode;
            previousValues = undefined;
          }

          for (let i = 0; i < colorNames.length; i++) {
            const value = snapshot.values[i];

            if (!value) {
              continue;
            }

            if (previousValues && previousValues[i] === value) {
              continue;
            }

            document.documentElement.style.setProperty(`--${colorNames[i]}`, value);
          }

          previousValues = snapshot.values;
        },
        { fireImmediately: true },
      );
    },
  }),
  injectionToken: anytimeAfterApplicationIsLoadedInjectionToken,
  causesSideEffects: true,
});

export default applyCustomColorsOnChangeInjectable;
