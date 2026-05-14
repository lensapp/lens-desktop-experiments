import { useState, type FC } from "react";
import { observer } from "mobx-react";
import { runInAction } from "mobx";
import { withInjectables } from "@lensapp/injectable-react";
import { type ColorTheme, colorThemeInjectable } from "@lensapp/user-preferences";
import { activeThemeInjectable } from "@lensapp/theme-renderer";
import { Button } from "@lensapp/button";
import { customDarkColorsInjectable, customLightColorsInjectable } from "../state/custom-theme-colors.injectable";
import { customThemeModeInjectable, type CustomThemeMode } from "../state/custom-theme-mode.injectable";
import { savedThemesInjectable, type SavedTheme } from "../state/saved-themes.injectable";
import { customThemeId } from "../themes/custom-theme.injectable";
import { darkThemeDefaults } from "../dark-theme-defaults";
import { lightThemeDefaults } from "../light-theme-defaults";
import { colorGroups, colorLabels } from "../colors-catalog";
import { presets, type PresetDefinition } from "../presets/presets-catalog";
import { expandPresetOverrides } from "../presets/expand-preset-overrides";
import { quickPalette } from "../quick-palette";
import { styles } from "./styles";
import type { IComputedValue, IObservableValue, ObservableMap, IObservableArray } from "mobx";
import type { LensTheme } from "@lensapp/theme";

interface Dependencies {
  readonly darkColors: ObservableMap<string, string>;
  readonly lightColors: ObservableMap<string, string>;
  readonly mode: IObservableValue<CustomThemeMode>;
  readonly savedThemes: IObservableArray<SavedTheme>;
  readonly colorTheme: IObservableValue<ColorTheme>;
  readonly activeTheme: IComputedValue<LensTheme>;
}

const hexValueOrFallback = (value: string | undefined): string => {
  if (!value) {
    return "#000000";
  }
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }
  if (/^#[0-9a-fA-F]{8}$/.test(value)) {
    return value.slice(0, 7);
  }
  return "#000000";
};

const colorsMatch = (a: Record<string, string>, b: Record<string, string>, keys: ReadonlyArray<string>): boolean =>
  keys.every((k) => (a[k] ?? "").toLowerCase() === (b[k] ?? "").toLowerCase());

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

const ModeToggle: FC<{
  readonly mode: CustomThemeMode;
  readonly onChange: (mode: CustomThemeMode) => void;
}> = ({ mode, onChange }) => (
  <div style={styles.modeToggleContainer} role="tablist" aria-label="Custom theme mode">
    <button
      type="button"
      role="tab"
      aria-selected={mode === "dark"}
      onClick={() => onChange("dark")}
      style={
        mode === "dark" ? { ...styles.modeToggleButton, ...styles.modeToggleButtonActive } : styles.modeToggleButton
      }
    >
      <span aria-hidden style={{ marginRight: 6 }}>
        ◐
      </span>
      Dark
    </button>
    <button
      type="button"
      role="tab"
      aria-selected={mode === "light"}
      onClick={() => onChange("light")}
      style={
        mode === "light" ? { ...styles.modeToggleButton, ...styles.modeToggleButtonActive } : styles.modeToggleButton
      }
    >
      <span aria-hidden style={{ marginRight: 6 }}>
        ◑
      </span>
      Light
    </button>
  </div>
);

const PresetGallery: FC<{
  readonly colorsState: ObservableMap<string, string>;
  readonly activeThemeId: string;
  readonly mode: CustomThemeMode;
  readonly onApply: (preset: PresetDefinition) => void;
  readonly filterType: CustomThemeMode | "all";
}> = observer(({ colorsState, activeThemeId, mode, onApply, filterType }) => {
  const visiblePresets = filterType === "all" ? presets : presets.filter((p) => p.type === filterType);
  const currentSnapshot = Object.fromEntries(colorsState.entries());

  const isPresetActive = (preset: PresetDefinition): boolean => {
    if (activeThemeId === preset.id) {
      return true;
    }

    if (activeThemeId === customThemeId && mode === preset.type) {
      const overrideKeys = Object.keys(preset.overrides);

      return overrideKeys.length > 0 && colorsMatch(currentSnapshot, preset.overrides, overrideKeys);
    }

    return false;
  };

  return (
    <div style={styles.presetGrid}>
      {visiblePresets.map((preset) => {
        const active = isPresetActive(preset);
        const cardStyle = active ? { ...styles.presetCard, ...styles.presetCardActive } : styles.presetCard;

        return (
          <button key={preset.id} type="button" onClick={() => onApply(preset)} style={cardStyle}>
            <div style={styles.presetSwatch}>
              {preset.swatch.map((c, i) => (
                <span key={i} style={{ ...styles.swatchCell, background: c }} />
              ))}
            </div>
            <div>
              <div style={styles.presetName}>
                {preset.name}
                <span style={preset.type === "light" ? styles.presetTypeBadgeLight : styles.presetTypeBadgeDark}>
                  {preset.type}
                </span>
              </div>
              <div style={styles.presetAuthor}>by {preset.author}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
});

const SavedThemesList: FC<{
  readonly savedThemes: IObservableArray<SavedTheme>;
  readonly onApply: (theme: SavedTheme) => void;
  readonly onDelete: (theme: SavedTheme) => void;
}> = observer(({ savedThemes, onApply, onDelete }) => {
  if (savedThemes.length === 0) {
    return (
      <div style={styles.emptyText}>No saved themes yet. Tweak some colors and use "Save as" below to keep them.</div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {savedThemes.map((theme) => {
        const swatchKeys = ["mainBackground", "primary", "magenta", "textColorAccent"];

        return (
          <div key={`${theme.name}-${theme.createdAt}`} style={styles.savedRow}>
            <div style={styles.savedSwatchRow}>
              {swatchKeys.map((k) => (
                <span key={k} style={{ ...styles.swatchCell, flex: 1, background: theme.colors[k] ?? "transparent" }} />
              ))}
            </div>
            <span style={styles.savedName}>{theme.name}</span>
            <span style={theme.mode === "light" ? styles.savedTypeBadgeLight : styles.savedTypeBadgeDark}>
              {theme.mode}
            </span>
            <span style={styles.savedMeta}>{new Date(theme.createdAt).toLocaleDateString()}</span>
            <Button label="Apply" primary onClick={() => onApply(theme)} />
            <Button label="Delete" plain onClick={() => onDelete(theme)} />
          </div>
        );
      })}
    </div>
  );
});

const QuickPaletteGrid: FC<{
  readonly colorsState: ObservableMap<string, string>;
}> = observer(({ colorsState }) => {
  const setBundle = (writes: ReadonlyArray<string>, value: string) => {
    runInAction(() => {
      for (const k of writes) {
        colorsState.set(k, value);
      }
    });
  };

  return (
    <div style={styles.quickPaletteGrid}>
      {quickPalette.map((entry) => {
        const current = colorsState.get(entry.read) ?? "";

        return (
          <div key={entry.id} style={styles.quickPaletteRow}>
            <input
              type="color"
              value={hexValueOrFallback(current)}
              onChange={(e) => setBundle(entry.writes, e.target.value)}
              style={styles.quickPaletteSwatchInput}
              aria-label={entry.label}
            />
            <div style={styles.quickPaletteText}>
              <div style={styles.quickPaletteLabel}>{entry.label}</div>
              <div style={styles.quickPaletteHint}>{entry.hint}</div>
            </div>
            <input
              type="text"
              value={current}
              onChange={(e) => setBundle(entry.writes, e.target.value)}
              style={styles.hexInput}
              spellCheck={false}
            />
          </div>
        );
      })}
    </div>
  );
});

const ColorTweakerGrid: FC<{
  readonly colorsState: ObservableMap<string, string>;
  readonly defaults: Readonly<Record<string, string>>;
}> = observer(({ colorsState, defaults }) => {
  const [filter, setFilter] = useState("");
  const needle = filter.trim().toLowerCase();

  const matches = (name: string): boolean => {
    if (!needle) {
      return true;
    }

    const label = (colorLabels[name] ?? "").toLowerCase();

    return name.toLowerCase().includes(needle) || label.includes(needle);
  };

  const setColor = (name: string, value: string) => {
    runInAction(() => colorsState.set(name, value));
  };

  const resetColor = (name: string) => {
    runInAction(() => colorsState.set(name, defaults[name] ?? "#000000"));
  };

  let isFirstGroup = true;

  return (
    <>
      <input
        type="text"
        placeholder="Filter colors…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={styles.searchInput}
      />
      {colorGroups.map((group) => {
        const visible = group.colors.filter((c) => matches(c.name));

        if (visible.length === 0) {
          return null;
        }

        const titleStyle = isFirstGroup ? styles.groupFirstTitle : styles.groupTitle;
        isFirstGroup = false;

        return (
          <div key={group.title}>
            <div style={titleStyle}>{group.title}</div>
            <div style={styles.colorGrid}>
              {visible.map((entry) => {
                const current = colorsState.get(entry.name) ?? "";
                const defaultValue = defaults[entry.name];
                const isOverridden = defaultValue !== undefined && current !== defaultValue;
                const rowStyle = isOverridden ? { ...styles.colorRow, ...styles.colorRowOverridden } : styles.colorRow;

                return (
                  <div key={entry.name} style={rowStyle} title={entry.name}>
                    <input
                      type="color"
                      value={hexValueOrFallback(current)}
                      onChange={(e) => setColor(entry.name, e.target.value)}
                      style={styles.colorSwatchInput}
                      aria-label={entry.label}
                    />
                    <span style={styles.colorLabel}>{entry.label}</span>
                    <input
                      type="text"
                      value={current}
                      onChange={(e) => setColor(entry.name, e.target.value)}
                      style={styles.hexInput}
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => resetColor(entry.name)}
                      style={styles.resetSlot}
                      title="Reset to default"
                      aria-label={`Reset ${entry.label}`}
                    >
                      ↺
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
});

const NonInjectedThemeTweakerPage = observer(
  ({ darkColors, lightColors, mode, savedThemes, colorTheme, activeTheme }: Dependencies) => {
    const [pendingName, setPendingName] = useState("");
    const [presetFilter, setPresetFilter] = useState<CustomThemeMode | "all">("all");

    const currentMode = mode.get();
    const activeMap = currentMode === "light" ? lightColors : darkColors;
    const activeDefaults = currentMode === "light" ? lightThemeDefaults : darkThemeDefaults;

    const activeThemeId = activeTheme.get().id;
    const activeThemeName = activeTheme.get().name;

    const selectCustomTheme = () => {
      colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId });
    };

    const setMode = (next: CustomThemeMode) => {
      runInAction(() => mode.set(next));
      selectCustomTheme();
    };

    const applyPreset = (preset: PresetDefinition) => {
      const expanded = expandPresetOverrides(preset.overrides);
      const targetMap = preset.type === "light" ? lightColors : darkColors;
      const targetDefaults = preset.type === "light" ? lightThemeDefaults : darkThemeDefaults;

      runInAction(() => {
        mode.set(preset.type);

        for (const [name, value] of Object.entries(expanded)) {
          targetMap.set(name, value);
        }
        for (const [name, value] of Object.entries(targetDefaults)) {
          if (!(name in expanded)) {
            targetMap.set(name, value);
          }
        }
      });

      selectCustomTheme();
    };

    const applySavedTheme = (theme: SavedTheme) => {
      const targetMap = theme.mode === "light" ? lightColors : darkColors;
      const targetDefaults = theme.mode === "light" ? lightThemeDefaults : darkThemeDefaults;

      runInAction(() => {
        mode.set(theme.mode);

        for (const [name, value] of Object.entries(targetDefaults)) {
          targetMap.set(name, theme.colors[name] ?? value);
        }
      });

      selectCustomTheme();
    };

    const saveCurrentAs = (name: string) => {
      const trimmed = name.trim();

      if (!trimmed) {
        return;
      }

      const snapshot: Record<string, string> = {};

      for (const [k, v] of activeMap.entries()) {
        snapshot[k] = v;
      }

      runInAction(() => {
        const existingIndex = savedThemes.findIndex((t) => t.name === trimmed);
        const newEntry: SavedTheme = {
          name: trimmed,
          createdAt: new Date().toISOString(),
          mode: currentMode,
          colors: snapshot,
        };

        if (existingIndex >= 0) {
          savedThemes[existingIndex] = newEntry;
        } else {
          savedThemes.push(newEntry);
        }
      });

      setPendingName("");
    };

    const deleteSaved = (theme: SavedTheme) => {
      runInAction(() => {
        const idx = savedThemes.findIndex((t) => t.name === theme.name && t.createdAt === theme.createdAt);
        if (idx >= 0) {
          savedThemes.splice(idx, 1);
        }
      });
    };

    const resetCurrentMode = () => {
      runInAction(() => {
        for (const [name, value] of Object.entries(activeDefaults)) {
          activeMap.set(name, value);
        }
      });
    };

    const exportCurrent = () => {
      const snapshot = Object.fromEntries(activeMap.entries());

      downloadJson(`lens-theme-tweaker-${currentMode}-${Date.now()}.json`, {
        name: "Exported theme",
        mode: currentMode,
        createdAt: new Date().toISOString(),
        colors: snapshot,
      });
    };

    const importTheme = async (file: File) => {
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
        const targetMap = importedMode === "light" ? lightColors : darkColors;
        const targetDefaults = importedMode === "light" ? lightThemeDefaults : darkThemeDefaults;
        const colors = parsed.colors;

        runInAction(() => {
          mode.set(importedMode);

          for (const [name, defaultValue] of Object.entries(targetDefaults)) {
            const v = colors[name];
            targetMap.set(name, typeof v === "string" ? v : defaultValue);
          }
        });

        selectCustomTheme();
      } catch {
        // Ignore invalid files
      }
    };

    return (
      <div style={styles.page}>
        <div style={styles.heroCard}>
          <div style={{ flex: 1 }}>
            <h2 style={styles.heroTitle}>
              🎨 Theme Tweaker<span style={styles.betaBadge}>Beta</span>
            </h2>
            <p style={styles.heroTag}>
              Pick a preset, tweak every color live, save your favourites. Changes apply instantly to the "Custom
              (Tweaker)" theme.
            </p>
          </div>
          <span style={styles.pill}>
            <span style={styles.pillDot} />
            Active: {activeThemeName}
          </span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Mode</h3>
            <span style={styles.cardSubtitle}>Light or dark base for the Custom theme</span>
          </div>
          <ModeToggle mode={currentMode} onChange={setMode} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Preset themes</h3>
            <div style={styles.filterBar}>
              {(["all", "dark", "light"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPresetFilter(f)}
                  style={presetFilter === f ? { ...styles.filterChip, ...styles.filterChipActive } : styles.filterChip}
                >
                  {f === "all" ? "All" : f === "dark" ? "Dark" : "Light"}
                </button>
              ))}
            </div>
          </div>
          <PresetGallery
            colorsState={activeMap}
            activeThemeId={activeThemeId}
            mode={currentMode}
            onApply={applyPreset}
            filterType={presetFilter}
          />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Saved themes</h3>
            <span style={styles.cardSubtitle}>Stored locally on this machine</span>
          </div>
          <SavedThemesList savedThemes={savedThemes} onApply={applySavedTheme} onDelete={deleteSaved} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Quick palette</h3>
            <span style={styles.cardSubtitle}>One control → multiple linked slots</span>
          </div>
          <QuickPaletteGrid colorsState={activeMap} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>All slots</h3>
            <span style={styles.cardSubtitle}>
              {activeMap.size} colors · editing the {currentMode} variant of "Custom (Tweaker)"
            </span>
          </div>
          <ColorTweakerGrid colorsState={activeMap} defaults={activeDefaults} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Manage</h3>
            <span style={styles.cardSubtitle}>Save · reset · export · import</span>
          </div>
          <div style={styles.actionsBar}>
            <input
              type="text"
              placeholder="Theme name…"
              value={pendingName}
              onChange={(e) => setPendingName(e.target.value)}
              style={styles.nameInput}
            />
            <Button label="Save as…" primary onClick={() => saveCurrentAs(pendingName)} />
            <Button label={`Reset ${currentMode}`} onClick={resetCurrentMode} />
            <Button label="Export JSON" onClick={exportCurrent} />
            <label style={{ display: "inline-block" }}>
              <input
                type="file"
                accept="application/json,.json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    void importTheme(file);
                  }

                  e.target.value = "";
                }}
              />
              <Button
                label="Import JSON"
                onClick={(e) => (e.currentTarget.previousSibling as HTMLInputElement).click()}
              />
            </label>
          </div>
        </div>
      </div>
    );
  },
);

export const ThemeTweakerPage = withInjectables<Dependencies>(NonInjectedThemeTweakerPage, {
  getProps: (di) => ({
    darkColors: di.inject(customDarkColorsInjectable),
    lightColors: di.inject(customLightColorsInjectable),
    mode: di.inject(customThemeModeInjectable),
    savedThemes: di.inject(savedThemesInjectable),
    colorTheme: di.inject(colorThemeInjectable),
    activeTheme: di.inject(activeThemeInjectable),
  }),
});
