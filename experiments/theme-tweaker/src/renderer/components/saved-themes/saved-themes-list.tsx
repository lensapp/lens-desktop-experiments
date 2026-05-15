import { Div, Span } from "@lensapp/element-components";
import { observer } from "mobx-react";
import { Button } from "@lensapp/button";
import type { IObservableArray } from "mobx";
import type { SavedTheme } from "../../state/saved-themes.injectable";

const SWATCH_KEYS = ["mainBackground", "primary", "magenta", "textColorAccent"] as const;

interface SavedThemesListProps {
  readonly savedThemes: IObservableArray<SavedTheme>;
  readonly onApply: (theme: SavedTheme) => void;
  readonly onDelete: (theme: SavedTheme) => void;
}

export const SavedThemesList = observer(({ savedThemes, onApply, onDelete }: SavedThemesListProps) => {
  if (savedThemes.length === 0) {
    return (
      <Div $font={{ size: "s" }} $padding={{ vertical: "s" }} $color="grey25">
        No saved themes yet. Tweak some colors and use &ldquo;Save as&rdquo; below to keep them.
      </Div>
    );
  }

  return (
    <Div $flex={{ direction: "vertical", gap: "xs" }}>
      {savedThemes.map((theme) => (
        <Div
          key={`${theme.name}-${theme.createdAt}`}
          $flex={{ direction: "horizontal", verticalAlign: "center", gap: "s" }}
          $padding={{ vertical: "xs", horizontal: "s" }}
          $backgroundColor="backgroundPrimary"
          $border={{ radius: "s" }}
        >
          <Div
            $flex={{ direction: "horizontal" }}
            $border={{ radius: "s" }}
            $overflow="hidden"
            $width="11xl"
            $height="xl"
          >
            {SWATCH_KEYS.map((k) => (
              <Span key={k} $width="stretch" $block style={{ background: theme.colors[k] ?? "transparent" }} />
            ))}
          </Div>
          <Span $font={{ size: "s", bold: "600" }} $color="textHighlight" $width="stretch" $overflow="hidden">
            {theme.name}
          </Span>
          <Span
            $padding={{ horizontal: "xs" }}
            $border={{ width: "xxs", color: theme.mode === "light" ? "notice" : "grey25", radius: "s" }}
            $color={theme.mode === "light" ? "notice" : "textHighlight"}
            $font={{ size: "xxs", bold: "600", uppercase: true }}
          >
            {theme.mode}
          </Span>
          <Span $font={{ size: "xs" }} $color="grey25">
            {new Date(theme.createdAt).toLocaleDateString()}
          </Span>
          <Button label="Apply" primary onClick={() => onApply(theme)} />
          <Button label="Delete" plain onClick={() => onDelete(theme)} />
        </Div>
      ))}
    </Div>
  );
});
