import { getInjectable } from "@lensapp/injectable";
import { lensThemeDeclarationInjectionToken, type LensTheme } from "@lensapp/theme";
import { customDarkColorsInjectable, customLightColorsInjectable } from "../state/custom-theme-colors.injectable";
import { customThemeModeInjectable } from "../state/custom-theme-mode.injectable";
import { darkThemeDefaults, darkTerminalDefaults } from "../dark-theme-defaults";
import { lightThemeDefaults, lightTerminalDefaults } from "../light-theme-defaults";

export const customThemeId = "theme-tweaker-custom";

const colorNames = Object.keys(darkThemeDefaults);

const customThemeInjectable = getInjectable({
  id: customThemeId,
  instantiate: (di): LensTheme => {
    const darkColors = di.inject(customDarkColorsInjectable);
    const lightColors = di.inject(customLightColorsInjectable);
    const mode = di.inject(customThemeModeInjectable);

    const colors = {} as Record<string, string>;

    for (const name of colorNames) {
      Object.defineProperty(colors, name, {
        enumerable: true,
        configurable: false,
        get: () => {
          if (mode.get() === "light") {
            return lightColors.get(name) ?? lightThemeDefaults[name] ?? "#000000";
          }

          return darkColors.get(name) ?? darkThemeDefaults[name] ?? "#000000";
        },
      });
    }

    const terminalProxy = new Proxy({} as Record<string, string>, {
      get: (_t, p) => {
        const defaults: Record<string, string> = mode.get() === "light" ? lightTerminalDefaults : darkTerminalDefaults;

        return defaults[p as string];
      },
      ownKeys: () => Object.keys(darkTerminalDefaults),
      getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    });

    return {
      id: customThemeId,
      name: "Custom (Tweaker)",
      get type() {
        return mode.get();
      },
      author: "You",
      description: "Live-editable theme — pick colors from the Theme Tweaker preferences",
      get monacoTheme() {
        return mode.get() === "light" ? "vs" : "clouds-midnight";
      },
      colors: colors as LensTheme["colors"],
      terminalColors: terminalProxy as LensTheme["terminalColors"],
    } as unknown as LensTheme;
  },
  injectionToken: lensThemeDeclarationInjectionToken,
});

export default customThemeInjectable;
