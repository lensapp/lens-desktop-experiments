import { getInjectable } from "@lensapp/injectable";
import { reaction } from "mobx";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { activeThemeInjectable } from "@lensapp/theme-renderer";
import { customThemeColorsInjectable } from "./state/custom-theme-colors.injectable";
import { customThemeId } from "./themes/custom-theme.injectable";
import { darkThemeDefaults } from "./dark-theme-defaults";

const colorNames = Object.keys(darkThemeDefaults);

/**
 * The host's apply-lens-theme reaction only fires when the active theme reference changes —
 * it cannot observe the inner colors of the Custom theme. This runnable closes that gap by
 * re-writing the --<color> CSS variables whenever the Custom theme is active and its observable
 * color map mutates.
 */
const applyCustomColorsOnChangeInjectable = getInjectable({
  id: "theme-tweaker-apply-custom-colors-on-change",
  instantiate: (di) => ({
    run: () => {
      const activeTheme = di.inject(activeThemeInjectable);
      const colorsState = di.inject(customThemeColorsInjectable);

      reaction(
        () => {
          if (activeTheme.get().id !== customThemeId) {
            return null;
          }

          // Explicit per-key reads so MobX observes value mutations on existing keys,
          // not just key set membership changes.
          return colorNames.map((k) => colorsState.get(k) ?? "");
        },
        (values) => {
          if (!values) return;

          for (let i = 0; i < colorNames.length; i++) {
            const value = values[i];

            if (value) {
              document.documentElement.style.setProperty(`--${colorNames[i]}`, value);
            }
          }
        },
        { fireImmediately: true },
      );
    },
  }),
  injectionToken: anytimeAfterApplicationIsLoadedInjectionToken,
  causesSideEffects: true,
});

export default applyCustomColorsOnChangeInjectable;
