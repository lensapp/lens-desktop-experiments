import { getInjectable } from "@lensapp/injectable";
import { lensThemeDeclarationInjectionToken, type LensTheme } from "@lensapp/theme";
import { customThemeColorsInjectable } from "../state/custom-theme-colors.injectable";
import { darkThemeDefaults, darkTerminalDefaults } from "../dark-theme-defaults";

export const customThemeId = "theme-tweaker-custom";

const customThemeInjectable = getInjectable({
  id: customThemeId,
  instantiate: (di): LensTheme => {
    const colorsState = di.inject(customThemeColorsInjectable);
    const colorNames = Object.keys(darkThemeDefaults);

    const colors = {} as Record<string, string>;
    for (const name of colorNames) {
      Object.defineProperty(colors, name, {
        enumerable: true,
        configurable: false,
        get: () => colorsState.get(name) ?? darkThemeDefaults[name] ?? "#000000",
      });
    }

    return {
      id: customThemeId,
      name: "Custom (Tweaker)",
      type: "dark",
      author: "You",
      description: "Live-editable theme — pick colors from the Theme Tweaker preferences",
      monacoTheme: "clouds-midnight",
      colors: colors as LensTheme["colors"],
      terminalColors: darkTerminalDefaults,
    };
  },
  injectionToken: lensThemeDeclarationInjectionToken,
});

export default customThemeInjectable;
