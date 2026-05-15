import { getInjectable, getInjectableBunch } from "@lensapp/injectable";
import { lensThemeDeclarationInjectionToken, type LensTheme } from "@lensapp/theme";
import { presets, type PresetDefinition } from "./presets-catalog";
import { darkThemeDefaults, darkTerminalDefaults } from "../dark-theme-defaults";
import { lightThemeDefaults, lightTerminalDefaults } from "../light-theme-defaults";
import { expandPresetOverrides } from "./expand-preset-overrides";

const buildPresetInjectable = (preset: PresetDefinition) =>
  getInjectable({
    id: preset.id,
    instantiate: (): LensTheme => {
      const baseDefaults = preset.type === "light" ? lightThemeDefaults : darkThemeDefaults;
      const terminalDefaults = preset.type === "light" ? lightTerminalDefaults : darkTerminalDefaults;

      return {
        id: preset.id,
        name: preset.name,
        type: preset.type,
        author: preset.author,
        description: preset.description,
        monacoTheme: preset.type === "light" ? "vs" : "clouds-midnight",
        colors: { ...baseDefaults, ...expandPresetOverrides(preset.overrides) } as LensTheme["colors"],
        terminalColors: terminalDefaults,
      };
    },
    injectionToken: lensThemeDeclarationInjectionToken,
  });

export default getInjectableBunch(presets.map(buildPresetInjectable));
