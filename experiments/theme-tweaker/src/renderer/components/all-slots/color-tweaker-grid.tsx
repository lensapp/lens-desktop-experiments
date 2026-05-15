import { Button, Div, Span } from "@lensapp/element-components";
import { Input, SearchInput } from "@lensapp/input";
import { observer } from "mobx-react";
import { useState } from "react";
import type { ObservableMap } from "mobx";
import { colorGroups, colorLabels, type ColorGroup } from "../../colors-catalog";
import type { CustomThemeMode } from "../../state/custom-theme-mode.injectable";
import type { ThemeTweakerActions } from "../manage/theme-tweaker-actions.injectable";
import { hexValueOrFallback } from "../_shared/hex-value";

interface ColorTweakerGridProps {
  readonly colorsState: ObservableMap<string, string>;
  readonly currentMode: CustomThemeMode;
  readonly actions: ThemeTweakerActions;
}

const ColorCard = observer(
  ({
    entry,
    current,
    currentMode,
    actions,
  }: {
    readonly entry: ColorGroup["colors"][number];
    readonly current: string;
    readonly currentMode: CustomThemeMode;
    readonly actions: ThemeTweakerActions;
  }) => (
    <Div
      title={entry.name}
      $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
      $padding={{ vertical: "xxs", horizontal: "s" }}
      $border={{ width: "xxs", color: "grey60", radius: "s" }}
      $backgroundColor="backgroundPrimary"
    >
      <Div $width="7xl" $height="xxl" $border={{ radius: "s" }} $overflow="hidden" $relative style={{ flexShrink: 0 }}>
        <input
          type="color"
          value={hexValueOrFallback(current)}
          onChange={(e) => actions.setColor(entry.name, e.target.value, currentMode)}
          aria-label={entry.label}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        />
      </Div>
      <Span
        $font={{ size: "xs", noWrap: true, textOverflow: "ellipsis" }}
        $color="textDefault"
        $width="stretch"
        $overflow="hidden"
      >
        {entry.label}
      </Span>
      <Div style={{ width: 96, flexShrink: 0 }}>
        <Input
          theme="round-black"
          value={current}
          onChange={(value) => actions.setColor(entry.name, value, currentMode)}
        />
      </Div>
      <Button
        type="button"
        onClick={() => actions.resetColor(entry.name, currentMode)}
        title="Reset to last applied"
        aria-label={`Reset ${entry.label}`}
        $color="textDefault"
        $cursor="pointer"
        $padding={{ horizontal: "3xs" }}
        $backgroundColor="transparent"
        $border={{ width: "zero" }}
        $font={{ size: "s" }}
      >
        ↺
      </Button>
    </Div>
  ),
);

// Always two columns. minmax(0, 1fr) (rather than 1fr) prevents long unbreakable label
// text from expanding its column past the other; element-components has no $grid plugin.
const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: 8,
} as const;

export const ColorTweakerGrid = observer(({ colorsState, currentMode, actions }: ColorTweakerGridProps) => {
  const [filter, setFilter] = useState("");
  const needle = filter.trim().toLowerCase();

  const matches = (name: string): boolean => {
    if (!needle) {
      return true;
    }

    const label = (colorLabels[name] ?? "").toLowerCase();

    return name.toLowerCase().includes(needle) || label.includes(needle);
  };

  let isFirstGroup = true;

  return (
    <Div $flex={{ direction: "vertical", gap: "s" }}>
      <SearchInput placeholder="Filter colors…" value={filter} onChange={setFilter} onClear={() => setFilter("")} />
      {colorGroups.map((group) => {
        const visible = group.colors.filter((c) => matches(c.name));

        if (visible.length === 0) {
          return null;
        }

        const isFirst = isFirstGroup;
        isFirstGroup = false;

        return (
          <Div key={group.title} $flex={{ direction: "vertical", gap: "xs" }} $margin={{ top: isFirst ? "zero" : "s" }}>
            <Div $font={{ size: "xs", bold: "600", uppercase: true }} $color="textHighlight">
              {group.title}
            </Div>
            <Div style={twoColumnGridStyle}>
              {visible.map((entry) => (
                <ColorCard
                  key={entry.name}
                  entry={entry}
                  current={colorsState.get(entry.name) ?? ""}
                  currentMode={currentMode}
                  actions={actions}
                />
              ))}
            </Div>
          </Div>
        );
      })}
    </Div>
  );
});
