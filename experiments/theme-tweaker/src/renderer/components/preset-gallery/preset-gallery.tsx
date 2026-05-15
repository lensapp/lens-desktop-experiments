import { Button, Div, Span } from "@lensapp/element-components";
import type { CustomThemeMode } from "../../state/custom-theme-mode.injectable";
import { presets, type PresetDefinition } from "../../presets/presets-catalog";

export type PresetFilter = CustomThemeMode | "all";

const filterLabel: Record<PresetFilter, string> = { all: "All", dark: "Dark", light: "Light" };

interface PresetFilterBarProps {
  readonly filter: PresetFilter;
  readonly onChange: (next: PresetFilter) => void;
}

export const PresetFilterBar = ({ filter, onChange }: PresetFilterBarProps) => (
  <Div $flex={{ direction: "horizontal", gap: "xs" }}>
    {(["all", "dark", "light"] as const).map((f) => {
      const active = filter === f;

      return (
        <Button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          $padding={{ vertical: "xxs", horizontal: "s" }}
          $border={{ width: "xxs", color: active ? "primary" : "grey60", radius: "s" }}
          $backgroundColor={active ? "primary" : "transparent"}
          $color={active ? "white" : "textDefault"}
          $font={{ size: "xs", bold: active ? "600" : false }}
          $cursor="pointer"
        >
          {filterLabel[f]}
        </Button>
      );
    })}
  </Div>
);

interface PresetGalleryProps {
  readonly activePresetIds: ReadonlySet<string>;
  readonly onApply: (preset: PresetDefinition) => void;
  readonly filterType: PresetFilter;
}

export const PresetGallery = ({ activePresetIds, onApply, filterType }: PresetGalleryProps) => {
  const visiblePresets = filterType === "all" ? presets : presets.filter((p) => p.type === filterType);

  return (
    <Div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
      {visiblePresets.map((preset) => {
        const active = activePresetIds.has(preset.id);

        return (
          <Button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset)}
            $flex={{ direction: "vertical", gap: "xs" }}
            $padding="s"
            $border={{ width: "xxs", color: active ? "primary" : "grey60", radius: "s" }}
            $backgroundColor="backgroundPrimary"
            $cursor="pointer"
            $textAlign="left"
          >
            <Div
              $border={{ radius: "s" }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                height: 40,
                overflow: "hidden",
              }}
            >
              {preset.swatch.map((c, i) => (
                <Span key={i} $block style={{ background: c }} />
              ))}
            </Div>
            <Div>
              <Div $font={{ size: "s", bold: "600" }} $color="textHighlight">
                {preset.name}
                <Span
                  $margin={{ left: "xs" }}
                  $padding={{ horizontal: "xs" }}
                  $border={{ width: "xxs", color: preset.type === "light" ? "notice" : "grey25", radius: "s" }}
                  $color={preset.type === "light" ? "notice" : "textHighlight"}
                  $font={{ size: "xxs", bold: "600", uppercase: true }}
                >
                  {preset.type}
                </Span>
              </Div>
              <Div $font={{ size: "xs" }} $margin={{ top: "3xs" }} $color="grey25">
                by {preset.author}
              </Div>
            </Div>
          </Button>
        );
      })}
    </Div>
  );
};
