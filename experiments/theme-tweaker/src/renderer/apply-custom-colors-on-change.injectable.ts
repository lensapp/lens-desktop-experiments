import { getInjectable } from "@lensapp/injectable";
import { reaction } from "mobx";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { activeThemeInjectable } from "@lensapp/theme-renderer";
import { customDarkColorsInjectable, customLightColorsInjectable } from "./state/custom-theme-colors.injectable";
import { customThemeModeInjectable } from "./state/custom-theme-mode.injectable";
import { customThemeId } from "./themes/custom-theme.injectable";
import { darkThemeDefaults } from "./dark-theme-defaults";

const colorNames = Object.keys(darkThemeDefaults);

/**
 * The host's apply-lens-theme reaction only fires when the active theme *reference* changes —
 * it cannot observe the inner colors or the mode of the Custom theme. This runnable closes that
 * gap: whenever the Custom theme is active, it re-writes the --<color> CSS variables and the
 * `theme-light` body class whenever the active color map or mode mutates.
 */
const applyCustomColorsOnChangeInjectable = getInjectable({
  id: "theme-tweaker-apply-custom-colors-on-change",
  instantiate: (di) => ({
    run: () => {
      const activeTheme = di.inject(activeThemeInjectable);
      const mode = di.inject(customThemeModeInjectable);
      const darkColors = di.inject(customDarkColorsInjectable);
      const lightColors = di.inject(customLightColorsInjectable);

      reaction(
        () => {
          if (activeTheme.get().id !== customThemeId) {
            return null;
          }

          const currentMode = mode.get();
          const activeMap = currentMode === "light" ? lightColors : darkColors;

          // Explicit per-key reads so MobX observes value mutations on existing keys,
          // not just key set membership changes.
          const values = colorNames.map((k) => activeMap.get(k) ?? "");

          return { mode: currentMode, values };
        },
        (snapshot) => {
          if (!snapshot) {
            return;
          }

          for (let i = 0; i < colorNames.length; i++) {
            const value = snapshot.values[i];

            if (value) {
              document.documentElement.style.setProperty(`--${colorNames[i]}`, value);
            }
          }

          document.body.classList.toggle("theme-light", snapshot.mode === "light");
        },
        { fireImmediately: true },
      );
    },
  }),
  injectionToken: anytimeAfterApplicationIsLoadedInjectionToken,
  causesSideEffects: true,
});

export default applyCustomColorsOnChangeInjectable;
