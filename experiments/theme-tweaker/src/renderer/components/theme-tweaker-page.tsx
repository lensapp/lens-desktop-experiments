import { useState, type FC } from "react";
import { observer } from "mobx-react";
import { runInAction } from "mobx";
import { withInjectables } from "@lensapp/injectable-react";
import { type ColorTheme, colorThemeInjectable } from "@lensapp/user-preferences";
import { activeThemeInjectable } from "@lensapp/theme-renderer";
import { Button } from "@lensapp/button";
import { customThemeColorsInjectable } from "../state/custom-theme-colors.injectable";
import { savedThemesInjectable, type SavedTheme } from "../state/saved-themes.injectable";
import { customThemeId } from "../themes/custom-theme.injectable";
import { darkThemeDefaults } from "../dark-theme-defaults";
import { colorGroups, colorLabels } from "../colors-catalog";
import { presets, type PresetDefinition } from "../presets/presets-catalog";
import { expandPresetOverrides } from "../presets/expand-preset-overrides";
import { quickPalette } from "../quick-palette";
import { styles } from "./styles";
import type { IComputedValue, IObservableValue, ObservableMap, IObservableArray } from "mobx";
import type { LensTheme } from "@lensapp/theme";

interface Dependencies {
  readonly colorsState: ObservableMap<string, string>;
  readonly savedThemes: IObservableArray<SavedTheme>;
  readonly colorTheme: IObservableValue<ColorTheme>;
  readonly activeTheme: IComputedValue<LensTheme>;
}

const hexValueOrFallback = (value: string | undefined): string => {
  if (!value) return "#000000";
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{8}$/.test(value)) return value.slice(0, 7);
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

const PresetGallery: FC<{
  readonly colorsState: ObservableMap<string, string>;
  readonly activeThemeId: string;
  readonly onApply: (preset: PresetDefinition) => void;
}> = observer(({ colorsState, activeThemeId, onApply }) => {
  const currentSnapshot = Object.fromEntries(colorsState.entries());

  const isPresetActive = (preset: PresetDefinition): boolean => {
    if (activeThemeId === preset.id) return true;

    if (activeThemeId === customThemeId) {
      const overrideKeys = Object.keys(preset.overrides);

      return overrideKeys.length > 0 && colorsMatch(currentSnapshot, preset.overrides, overrideKeys);
    }

    return false;
  };

  return (
    <div style={styles.presetGrid}>
      {presets.map((preset) => {
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
              <div style={styles.presetName}>{preset.name}</div>
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
    return <div style={styles.emptyText}>No saved themes yet. Tweak some colors and use Save below.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {savedThemes.map((theme) => {
        const swatchKeys = ["mainBackground", "primary", "magenta", "textColorAccent"];

        return (
          <div key={`${theme.name}-${theme.createdAt}`} style={styles.savedRow}>
            <div style={styles.savedSwatchRow}>
              {swatchKeys.map((k) => (
                <span
                  key={k}
                  style={{ ...styles.swatchCell, flex: 1, background: theme.colors[k] ?? "transparent" }}
                />
              ))}
            </div>
            <span style={styles.savedName}>{theme.name}</span>
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
}> = observer(({ colorsState }) => {
  const [filter, setFilter] = useState("");
  const needle = filter.trim().toLowerCase();

  const matches = (name: string): boolean => {
    if (!needle) return true;

    const label = (colorLabels[name] ?? "").toLowerCase();

    return name.toLowerCase().includes(needle) || label.includes(needle);
  };

  const setColor = (name: string, value: string) => {
    runInAction(() => colorsState.set(name, value));
  };

  const resetColor = (name: string) => {
    runInAction(() => colorsState.set(name, darkThemeDefaults[name] ?? "#000000"));
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

        if (visible.length === 0) return null;

        const titleStyle = isFirstGroup ? styles.groupFirstTitle : styles.groupTitle;
        isFirstGroup = false;

        return (
          <div key={group.title}>
            <div style={titleStyle}>{group.title}</div>
            <div style={styles.colorGrid}>
              {visible.map((entry) => {
                const current = colorsState.get(entry.name) ?? "";
                const defaultValue = darkThemeDefaults[entry.name];
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

const NonInjectedThemeTweakerPage = observer(({ colorsState, savedThemes, colorTheme, activeTheme }: Dependencies) => {
  const [pendingName, setPendingName] = useState("");

  const activeThemeId = activeTheme.get().id;
  const activeThemeName = activeTheme.get().name;

  const selectCustomTheme = () => {
    colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId });
  };

  const applyPreset = (preset: PresetDefinition) => {
    const expanded = expandPresetOverrides(preset.overrides);

    runInAction(() => {
      for (const [name, value] of Object.entries(expanded)) {
        colorsState.set(name, value);
      }
      for (const [name, value] of Object.entries(darkThemeDefaults)) {
        if (!(name in expanded)) {
          colorsState.set(name, value);
        }
      }
    });

    selectCustomTheme();
  };

  const applySavedTheme = (theme: SavedTheme) => {
    runInAction(() => {
      for (const [name, value] of Object.entries(darkThemeDefaults)) {
        colorsState.set(name, theme.colors[name] ?? value);
      }
    });

    selectCustomTheme();
  };

  const saveCurrentAs = (name: string) => {
    const trimmed = name.trim();

    if (!trimmed) return;

    const snapshot: Record<string, string> = {};

    for (const [k, v] of colorsState.entries()) {
      snapshot[k] = v;
    }

    runInAction(() => {
      const existingIndex = savedThemes.findIndex((t) => t.name === trimmed);
      const newEntry: SavedTheme = {
        name: trimmed,
        createdAt: new Date().toISOString(),
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
      if (idx >= 0) savedThemes.splice(idx, 1);
    });
  };

  const resetToDark = () => {
    runInAction(() => {
      for (const [name, value] of Object.entries(darkThemeDefaults)) {
        colorsState.set(name, value);
      }
    });
  };

  const exportCurrent = () => {
    const snapshot = Object.fromEntries(colorsState.entries());

    downloadJson(`lens-theme-tweaker-${Date.now()}.json`, {
      name: "Exported theme",
      createdAt: new Date().toISOString(),
      colors: snapshot,
    });
  };

  const importTheme = async (file: File) => {
    try {
      const parsed = (await readJsonFile(file)) as { colors?: Record<string, unknown>; name?: string };

      if (!parsed || typeof parsed !== "object" || !parsed.colors || typeof parsed.colors !== "object") {
        return;
      }

      const colors = parsed.colors;

      runInAction(() => {
        for (const [name, defaultValue] of Object.entries(darkThemeDefaults)) {
          const v = colors[name];
          colorsState.set(name, typeof v === "string" ? v : defaultValue);
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
        <div>
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
          <h3 style={styles.cardTitle}>Preset themes</h3>
          <span style={styles.cardSubtitle}>Click to apply</span>
        </div>
        <PresetGallery colorsState={colorsState} activeThemeId={activeThemeId} onApply={applyPreset} />
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
        <QuickPaletteGrid colorsState={colorsState} />
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>All slots</h3>
          <span style={styles.cardSubtitle}>{colorsState.size} colors · changes apply to "Custom (Tweaker)"</span>
        </div>
        <ColorTweakerGrid colorsState={colorsState} />
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
          <Button label="Reset to dark defaults" onClick={resetToDark} />
          <Button label="Export JSON" onClick={exportCurrent} />
          <label style={{ display: "inline-block" }}>
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) void importTheme(file);

                e.target.value = "";
              }}
            />
            <Button label="Import JSON" onClick={(e) => (e.currentTarget.previousSibling as HTMLInputElement).click()} />
          </label>
        </div>
      </div>
    </div>
  );
});

export const ThemeTweakerPage = withInjectables<Dependencies>(NonInjectedThemeTweakerPage, {
  getProps: (di) => ({
    colorsState: di.inject(customThemeColorsInjectable),
    savedThemes: di.inject(savedThemesInjectable),
    colorTheme: di.inject(colorThemeInjectable),
    activeTheme: di.inject(activeThemeInjectable),
  }),
});
