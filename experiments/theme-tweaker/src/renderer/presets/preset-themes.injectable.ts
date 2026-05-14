import { getInjectable, getInjectableBunch } from "@lensapp/injectable";
import { lensThemeDeclarationInjectionToken, type LensTheme } from "@lensapp/theme";
import { presets, type PresetDefinition } from "./presets-catalog";
import { darkThemeDefaults, darkTerminalDefaults } from "../dark-theme-defaults";
import { expandPresetOverrides } from "./expand-preset-overrides";

const buildPresetInjectable = (preset: PresetDefinition) =>
  getInjectable({
    id: preset.id,
    instantiate: (): LensTheme => ({
      id: preset.id,
      name: preset.name,
      type: preset.type,
      author: preset.author,
      description: preset.description,
      monacoTheme: "clouds-midnight",
      colors: { ...darkThemeDefaults, ...expandPresetOverrides(preset.overrides) } as LensTheme["colors"],
      terminalColors: darkTerminalDefaults,
    }),
    injectionToken: lensThemeDeclarationInjectionToken,
  });

export default getInjectableBunch(presets.map(buildPresetInjectable));
