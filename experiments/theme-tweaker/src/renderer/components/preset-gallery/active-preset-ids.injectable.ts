import { getInjectable } from "@lensapp/injectable";
import { computed } from "mobx";
import type { IComputedValue } from "mobx";
import { activeThemeInjectable } from "@lensapp/theme-renderer";
import { customDarkColorsInjectable, customLightColorsInjectable } from "../../state/custom-theme-colors.injectable";
import { customThemeModeInjectable } from "../../state/custom-theme-mode.injectable";
import { customThemeId } from "../../themes/custom-theme-id";
import { presets } from "../../presets/presets-catalog";
import { darkThemeDefaults } from "../../dark-theme-defaults";
import { lightThemeDefaults } from "../../light-theme-defaults";

const colorsMatch = (a: Record<string, string>, b: Record<string, string>, keys: ReadonlyArray<string>): boolean =>
  keys.every((k) => (a[k] ?? "").toLowerCase() === (b[k] ?? "").toLowerCase());

export const activePresetIdsInjectable = getInjectable({
  id: "theme-tweaker-active-preset-ids",
  instantiate: async (di): Promise<IComputedValue<ReadonlySet<string>>> => {
    const activeTheme = di.inject(activeThemeInjectable);
    const mode = await di.inject(customThemeModeInjectable);
    const darkColors = await di.inject(customDarkColorsInjectable);
    const lightColors = await di.inject(customLightColorsInjectable);

    return computed<ReadonlySet<string>>(() => {
      const themeId = activeTheme.get().id;
      const directMatch = presets.find((p) => p.id === themeId);

      if (directMatch) {
        return new Set([directMatch.id]);
      }

      if (themeId !== customThemeId) {
        return new Set<string>();
      }

      const currentMode = mode.get();
      const activeMap = currentMode === "light" ? lightColors : darkColors;
      const snapshot = Object.fromEntries(activeMap.entries());
      const modeDefaults = currentMode === "light" ? lightThemeDefaults : darkThemeDefaults;

      const matchingIds = new Set<string>();

      for (const preset of presets) {
        if (preset.type !== currentMode) {
          continue;
        }

        const overrideKeys = Object.keys(preset.overrides);

        if (overrideKeys.length === 0) {
          // A preset with no overrides (e.g. "Lens Dark") is active when the current colors
          // match the mode's defaults exactly.
          if (colorsMatch(snapshot, modeDefaults, Object.keys(modeDefaults))) {
            matchingIds.add(preset.id);
          }
        } else if (colorsMatch(snapshot, preset.overrides as Record<string, string>, overrideKeys)) {
          matchingIds.add(preset.id);
        }
      }

      return matchingIds;
    });
  },
});
