import { getInjectable } from "@lensapp/injectable";
import { lensThemeDeclarationInjectionToken, type LensTheme } from "@lensapp/theme";
import {
  customDarkColorsPersistedInjectable,
  customLightColorsPersistedInjectable,
} from "../state/custom-theme-colors.injectable";
import { customThemeModePersistedInjectable } from "../state/custom-theme-mode.injectable";
import { darkThemeDefaults, darkTerminalDefaults } from "../dark-theme-defaults";
import { lightThemeDefaults, lightTerminalDefaults } from "../light-theme-defaults";
import { customThemeId } from "./custom-theme-id";

const colorNames = Object.keys(darkThemeDefaults);

export const customThemeInjectable = getInjectable({
  id: customThemeId,
  instantiate: (di): LensTheme => {
    const darkColorsPersisted = di.inject(customDarkColorsPersistedInjectable);
    const lightColorsPersisted = di.inject(customLightColorsPersistedInjectable);
    const modePersisted = di.inject(customThemeModePersistedInjectable);

    const currentMode = () => modePersisted.reactive.current()?.get() ?? "dark";

    const colors = {} as Record<string, string>;

    for (const name of colorNames) {
      Object.defineProperty(colors, name, {
        enumerable: true,
        configurable: false,
        get: () => {
          if (currentMode() === "light") {
            return lightColorsPersisted.reactive.current()?.get(name) ?? lightThemeDefaults[name] ?? "#000000";
          }

          return darkColorsPersisted.reactive.current()?.get(name) ?? darkThemeDefaults[name] ?? "#000000";
        },
      });
    }

    const terminalProxy = new Proxy({} as Record<string, string>, {
      get: (_t, p) => {
        const defaults: Record<string, string> =
          currentMode() === "light" ? lightTerminalDefaults : darkTerminalDefaults;

        return defaults[p as string];
      },
      ownKeys: () => Object.keys(darkTerminalDefaults),
      getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    });

    return {
      id: customThemeId,
      name: "Custom (Tweaker)",
      get type() {
        return currentMode();
      },
      author: "You",
      description: "Live-editable theme — pick colors from the Theme Tweaker preferences",
      get monacoTheme() {
        return currentMode() === "light" ? "vs" : "clouds-midnight";
      },
      colors: colors as LensTheme["colors"],
      terminalColors: terminalProxy as LensTheme["terminalColors"],
    } as unknown as LensTheme;
  },
  injectionToken: lensThemeDeclarationInjectionToken,
});

export default customThemeInjectable;
