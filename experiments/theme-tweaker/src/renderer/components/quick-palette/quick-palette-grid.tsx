import { Div, Span } from "@lensapp/element-components";
import { Input } from "@lensapp/input";
import { observer } from "mobx-react";
import { runInAction } from "mobx";
import type { ObservableMap } from "mobx";
import { quickPalette } from "../../quick-palette";
import { hexValueOrFallback } from "../_shared/hex-value";

const setBundleOnMap = (colorsState: ObservableMap<string, string>, writes: ReadonlyArray<string>, value: string) => {
  runInAction(() => {
    for (const k of writes) {
      colorsState.set(k, value);
    }
  });
};

interface QuickPaletteGridProps {
  readonly colorsState: ObservableMap<string, string>;
}

// Always two columns. minmax(0, 1fr) (rather than 1fr) prevents long unbreakable label
// text from expanding its column past the other; element-components has no $grid plugin.
const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: 8,
} as const;

export const QuickPaletteGrid = observer(({ colorsState }: QuickPaletteGridProps) => (
  <Div style={twoColumnGridStyle}>
    {quickPalette.map((entry) => {
      const current = colorsState.get(entry.read) ?? "";

      return (
        <Div
          key={entry.id}
          $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
          $padding={{ vertical: "xxs", horizontal: "s" }}
          $backgroundColor="backgroundPrimary"
          $border={{ width: "xxs", color: "grey60", radius: "s" }}
        >
          <Div
            $width="7xl"
            $height="xxl"
            $border={{ radius: "s" }}
            $overflow="hidden"
            $relative
            style={{ flexShrink: 0 }}
          >
            <input
              type="color"
              value={hexValueOrFallback(current)}
              onChange={(e) => setBundleOnMap(colorsState, entry.writes, e.target.value)}
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
          <Div $flex={{ direction: "vertical" }} $width="stretch" $overflow="hidden">
            <Div $font={{ size: "xs", bold: "600", noWrap: true, textOverflow: "ellipsis" }} $color="textHighlight">
              {entry.label}
            </Div>
            <Span $font={{ size: "xxs", noWrap: true, textOverflow: "ellipsis" }} $color="grey25">
              {entry.hint}
            </Span>
          </Div>
          <Div style={{ width: 96, flexShrink: 0 }}>
            <Input
              theme="round-black"
              value={current}
              onChange={(value) => setBundleOnMap(colorsState, entry.writes, value)}
            />
          </Div>
        </Div>
      );
    })}
  </Div>
));
