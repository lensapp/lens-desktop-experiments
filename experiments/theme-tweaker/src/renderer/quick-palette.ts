/**
 * Logical "surfaces" the user thinks in terms of. Each surface drives several CSS variables —
 * Lens components reach colors through different tokens (semantic slots vs. the underlying grey
 * scale), so tweaking just one rarely flips the surface visibly. The Quick palette section in
 * the UI exposes one control per surface and writes the bundle.
 *
 * `read` is the canonical slot the UI shows as the current color.
 * `writes` are all slots the picker updates atomically.
 */
export interface QuickPaletteEntry {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly read: string;
  readonly writes: ReadonlyArray<string>;
}

export const quickPalette: ReadonlyArray<QuickPaletteEntry> = [
  {
    id: "window-background",
    label: "Window background",
    hint: "Outer canvas, deep behind every panel",
    read: "grey100",
    writes: ["grey100", "mainBackground", "backgroundSecondary", "layoutBackground", "dockHeadBackground"],
  },
  {
    id: "main-surface",
    label: "Main surface",
    hint: "Hotbar, dock, top bar, table headers",
    read: "grey80",
    writes: [
      "grey80",
      "backgroundPrimary",
      "itemListToolbarBackground",
      "tableHeaderBackground",
      "modalHeaderBg",
      "modalFooterBg",
      "dockInfoBackground",
    ],
  },
  {
    id: "raised-panel",
    label: "Raised panel",
    hint: "Cards, modals, hover-floats",
    read: "grey70",
    writes: ["grey70", "modalContentBg", "contentColor"],
  },
  {
    id: "border-strong",
    label: "Strong border",
    hint: "Layout outlines and dividers",
    read: "grey60",
    writes: ["grey60", "borderColor", "layoutBorderColor", "modalDividerColor"],
  },
  {
    id: "sidebar",
    label: "Sidebar / navigator",
    hint: "Cluster nav + secondary lists",
    read: "grey40",
    writes: ["grey40", "sidebarBackground", "clusterMenuCellBackground", "menuSelectedOptionBgc"],
  },
  {
    id: "border-faint",
    label: "Faint divider",
    hint: "Hairlines, inputs, column resizers",
    read: "grey30",
    writes: ["grey30", "borderFaintColor", "inputControlBorder", "columnResizerColor", "hrColor"],
  },
  {
    id: "text-primary",
    label: "Primary text",
    hint: "Body labels, table cells",
    read: "grey20",
    writes: ["grey20", "textColorPrimary", "textColorTertiary", "settingsColor", "modalTextColor"],
  },
  {
    id: "text-bright",
    label: "Bright text",
    hint: "Headings, accents",
    read: "grey10",
    writes: ["grey10", "textColorAccent", "modalAccentColor"],
  },
];
