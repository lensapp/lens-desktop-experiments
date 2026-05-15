import { getInjectable } from "@lensapp/injectable";
import { runInAction } from "mobx";
import { colorThemeInjectable } from "@lensapp/user-preferences";
import { customDarkColorsInjectable, customLightColorsInjectable } from "../../state/custom-theme-colors.injectable";
import {
  customDarkBaselineInjectable,
  customLightBaselineInjectable,
} from "../../state/custom-theme-baseline.injectable";
import { customThemeModeInjectable, type CustomThemeMode } from "../../state/custom-theme-mode.injectable";
import { savedThemesInjectable, type SavedTheme } from "../../state/saved-themes.injectable";
import { customThemeId } from "../../themes/custom-theme-id";
import { darkThemeDefaults } from "../../dark-theme-defaults";
import { lightThemeDefaults } from "../../light-theme-defaults";
import { expandPresetOverrides } from "../../presets/expand-preset-overrides";
import type { PresetDefinition } from "../../presets/presets-catalog";

const downloadJson = (filename: string, payload: unknown) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};

const readJsonFile = (file: File): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch (e) {
        reject(e);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

export interface ThemeTweakerActions {
  readonly setMode: (next: CustomThemeMode) => void;
  readonly applyPreset: (preset: PresetDefinition) => void;
  readonly applySavedTheme: (theme: SavedTheme) => void;
  readonly saveCurrentAs: (name: string, currentMode: CustomThemeMode) => boolean;
  readonly deleteSaved: (theme: SavedTheme) => void;
  readonly resetCurrentMode: (currentMode: CustomThemeMode) => void;
  readonly resetColor: (name: string, currentMode: CustomThemeMode) => void;
  readonly setColor: (name: string, value: string, currentMode: CustomThemeMode) => void;
  readonly exportCurrent: (currentMode: CustomThemeMode) => void;
  readonly importTheme: (file: File) => Promise<void>;
}

export const themeTweakerActionsInjectable = getInjectable({
  id: "theme-tweaker-actions",
  instantiate: async (di): Promise<ThemeTweakerActions> => {
    const darkColors = await di.inject(customDarkColorsInjectable);
    const lightColors = await di.inject(customLightColorsInjectable);
    const darkBaseline = await di.inject(customDarkBaselineInjectable);
    const lightBaseline = await di.inject(customLightBaselineInjectable);
    const mode = await di.inject(customThemeModeInjectable);
    const savedThemes = await di.inject(savedThemesInjectable);
    const colorTheme = di.inject(colorThemeInjectable);

    const mapFor = (m: CustomThemeMode) => (m === "light" ? lightColors : darkColors);
    const baselineFor = (m: CustomThemeMode) => (m === "light" ? lightBaseline : darkBaseline);
    const defaultsFor = (m: CustomThemeMode) => (m === "light" ? lightThemeDefaults : darkThemeDefaults);

    const writeWithBaseline = (m: CustomThemeMode, snapshot: Record<string, string>) => {
      const targetMap = mapFor(m);
      const targetBaseline = baselineFor(m);

      for (const [name, value] of Object.entries(snapshot)) {
        targetMap.set(name, value);
        targetBaseline.set(name, value);
      }
    };

    return {
      setMode: (next) => {
        runInAction(() => {
          mode.set(next);
          colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId });
        });
      },

      applyPreset: (preset) => {
        const expanded = expandPresetOverrides(preset.overrides);
        const targetDefaults = defaultsFor(preset.type);
        const fullSnapshot: Record<string, string> = { ...targetDefaults, ...expanded };

        runInAction(() => {
          mode.set(preset.type);
          writeWithBaseline(preset.type, fullSnapshot);
          colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId });
        });
      },

      applySavedTheme: (theme) => {
        const targetDefaults = defaultsFor(theme.mode);
        const fullSnapshot: Record<string, string> = { ...targetDefaults };

        for (const name of Object.keys(targetDefaults)) {
          if (typeof theme.colors[name] === "string") {
            fullSnapshot[name] = theme.colors[name] as string;
          }
        }

        runInAction(() => {
          mode.set(theme.mode);
          writeWithBaseline(theme.mode, fullSnapshot);
          colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId });
        });
      },

      saveCurrentAs: (name, currentMode) => {
        const trimmed = name.trim();

        if (!trimmed) {
          return false;
        }

        const activeMap = mapFor(currentMode);
        const snapshot: Record<string, string> = {};

        for (const [k, v] of activeMap.entries()) {
          snapshot[k] = v;
        }

        runInAction(() => {
          const newEntry: SavedTheme = {
            name: trimmed,
            createdAt: new Date().toISOString(),
            mode: currentMode,
            colors: snapshot,
          };
          const existingIndex = savedThemes.findIndex((t) => t.name === trimmed);

          if (existingIndex >= 0) {
            savedThemes.splice(existingIndex, 1);
          }

          savedThemes.unshift(newEntry);
        });

        return true;
      },

      deleteSaved: (theme) => {
        runInAction(() => {
          const idx = savedThemes.findIndex((t) => t.name === theme.name && t.createdAt === theme.createdAt);

          if (idx >= 0) {
            savedThemes.splice(idx, 1);
          }
        });
      },

      resetCurrentMode: (currentMode) => {
        const activeMap = mapFor(currentMode);
        const baselineMap = baselineFor(currentMode);

        runInAction(() => {
          for (const [name, value] of baselineMap.entries()) {
            activeMap.set(name, value);
          }
        });
      },

      resetColor: (name, currentMode) => {
        const activeMap = mapFor(currentMode);
        const baselineMap = baselineFor(currentMode);
        const baselineValue = baselineMap.get(name) ?? defaultsFor(currentMode)[name] ?? "#000000";

        runInAction(() => {
          activeMap.set(name, baselineValue);
        });
      },

      setColor: (name, value, currentMode) => {
        const activeMap = mapFor(currentMode);

        runInAction(() => {
          activeMap.set(name, value);
        });
      },

      exportCurrent: (currentMode) => {
        const activeMap = mapFor(currentMode);
        const snapshot = Object.fromEntries(activeMap.entries());

        downloadJson(`lens-theme-tweaker-${currentMode}-${Date.now()}.json`, {
          name: "Exported theme",
          mode: currentMode,
          createdAt: new Date().toISOString(),
          colors: snapshot,
        });
      },

      importTheme: async (file) => {
        try {
          const parsed = (await readJsonFile(file)) as {
            colors?: Record<string, unknown>;
            name?: string;
            mode?: unknown;
          };

          if (!parsed || typeof parsed !== "object" || !parsed.colors || typeof parsed.colors !== "object") {
            return;
          }

          const importedMode: CustomThemeMode = parsed.mode === "light" ? "light" : "dark";
          const targetDefaults = defaultsFor(importedMode);
          const colors = parsed.colors;
          const fullSnapshot: Record<string, string> = { ...targetDefaults };

          for (const name of Object.keys(targetDefaults)) {
            const v = colors[name];

            if (typeof v === "string") {
              fullSnapshot[name] = v;
            }
          }

          runInAction(() => {
            mode.set(importedMode);
            writeWithBaseline(importedMode, fullSnapshot);
            colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId });
          });
        } catch {
          // Ignore invalid files
        }
      },
    };
  },
});

export default themeTweakerActionsInjectable;
