import { Button, Div, Span } from "@lensapp/element-components";
import type { CustomThemeMode } from "../../state/custom-theme-mode.injectable";

interface ModeButtonProps {
  readonly active: boolean;
  readonly glyph: string;
  readonly label: string;
  readonly onClick: () => void;
}

const ModeButton = ({ active, glyph, label, onClick }: ModeButtonProps) => (
  <Button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    $padding={{ vertical: "xxs", horizontal: "m" }}
    $backgroundColor={active ? "primary" : "transparent"}
    $color={active ? "white" : "textDefault"}
    $font={{ size: "s", bold: active ? "600" : false }}
    $cursor="pointer"
    $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
  >
    <Span aria-hidden>{glyph}</Span>
    {label}
  </Button>
);

interface ModeToggleProps {
  readonly mode: CustomThemeMode;
  readonly onChange: (mode: CustomThemeMode) => void;
}

export const ModeToggle = ({ mode, onChange }: ModeToggleProps) => (
  <Div
    $flex={{ direction: "horizontal", horizontalAlign: "left" }}
    $border={{ width: "xxs", color: "grey60", radius: "s" }}
    $overflow="hidden"
    role="tablist"
    aria-label="Custom theme mode"
  >
    <ModeButton active={mode === "dark"} glyph="◐" label="Dark" onClick={() => onChange("dark")} />
    <ModeButton active={mode === "light"} glyph="◑" label="Light" onClick={() => onChange("light")} />
  </Div>
);
