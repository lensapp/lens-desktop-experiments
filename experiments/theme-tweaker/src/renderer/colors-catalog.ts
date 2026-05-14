export interface ColorGroup {
  readonly title: string;
  readonly colors: ReadonlyArray<{ readonly name: string; readonly label: string }>;
}

export const colorGroups: ReadonlyArray<ColorGroup> = [
  {
    title: "Brand & accents",
    colors: [
      { name: "primary", label: "Primary" },
      { name: "blue", label: "Blue" },
      { name: "magenta", label: "Magenta" },
      { name: "golden", label: "Golden" },
      { name: "success", label: "Success" },
      { name: "notice", label: "Notice" },
      { name: "warning", label: "Warning" },
      { name: "critical", label: "Critical" },
      { name: "code", label: "Code" },
    ],
  },
  {
    title: "Text",
    colors: [
      { name: "textColorPrimary", label: "Primary text" },
      { name: "textColorSecondary", label: "Secondary text" },
      { name: "textColorTertiary", label: "Tertiary text" },
      { name: "textColorAccent", label: "Accent text" },
      { name: "textColorDimmed", label: "Dimmed text" },
    ],
  },
  {
    title: "Surfaces",
    colors: [
      { name: "mainBackground", label: "Main background" },
      { name: "backgroundPrimary", label: "Background primary" },
      { name: "backgroundSecondary", label: "Background secondary" },
      { name: "contentColor", label: "Content" },
      { name: "canvasBackground", label: "Canvas" },
      { name: "settingsBackground", label: "Settings panel" },
      { name: "tooltipBackground", label: "Tooltip" },
      { name: "filterAreaBackground", label: "Filter area" },
    ],
  },
  {
    title: "Borders & dividers",
    colors: [
      { name: "borderColor", label: "Border" },
      { name: "borderFaintColor", label: "Faint border" },
      { name: "hrColor", label: "Horizontal rule" },
      { name: "layoutBorderColor", label: "Layout border" },
      { name: "columnResizerColor", label: "Column resizer" },
    ],
  },
  {
    title: "Sidebar",
    colors: [
      { name: "sidebarBackground", label: "Background" },
      { name: "sidebarLogoBackground", label: "Logo background" },
      { name: "sidebarActiveColor", label: "Active item" },
      { name: "sidebarSubmenuActiveColor", label: "Submenu active" },
      { name: "sidebarItemHoverBackground", label: "Item hover" },
    ],
  },
  {
    title: "Layout & tabs",
    colors: [
      { name: "layoutBackground", label: "Layout background" },
      { name: "layoutTabsBackground", label: "Tabs background" },
      { name: "layoutTabsActiveColor", label: "Active tab" },
      { name: "layoutTabsLineColor", label: "Tab line" },
      { name: "navSelectedBackground", label: "Nav selected" },
      { name: "navHoverColor", label: "Nav hover" },
    ],
  },
  {
    title: "Buttons",
    colors: [
      { name: "buttonPrimaryBackground", label: "Primary" },
      { name: "buttonDefaultBackground", label: "Default" },
      { name: "buttonLightBackground", label: "Light" },
      { name: "buttonAccentBackground", label: "Accent" },
      { name: "buttonDisabledBackground", label: "Disabled" },
    ],
  },
  {
    title: "Inputs",
    colors: [
      { name: "inputControlBackground", label: "Background" },
      { name: "inputControlBorder", label: "Border" },
      { name: "inputControlHoverBorder", label: "Hover border" },
      { name: "inputOptionHoverColor", label: "Option hover" },
      { name: "inputOptionSelectedColor", label: "Option selected" },
      { name: "menuActiveBackground", label: "Menu active" },
      { name: "menuSelectedOptionBgc", label: "Menu selected option" },
      { name: "radioActiveBackground", label: "Radio active" },
    ],
  },
  {
    title: "Tables",
    colors: [
      { name: "tableHeaderBackground", label: "Header" },
      { name: "tableBgcStripe", label: "Row stripe" },
      { name: "tableBgcSelected", label: "Row selected" },
      { name: "tableSelectedRowColor", label: "Selected text" },
      { name: "itemListToolbarBackground", label: "List toolbar" },
      { name: "itemListBackground", label: "List background" },
    ],
  },
  {
    title: "Status",
    colors: [
      { name: "colorSuccess", label: "Success" },
      { name: "colorOk", label: "OK" },
      { name: "colorInfo", label: "Info" },
      { name: "colorError", label: "Error" },
      { name: "colorSoftError", label: "Soft error" },
      { name: "colorWarning", label: "Warning" },
      { name: "colorVague", label: "Vague" },
      { name: "colorTerminated", label: "Terminated" },
    ],
  },
  {
    title: "Modal",
    colors: [
      { name: "modalHeaderBg", label: "Header background" },
      { name: "modalHeaderTextColor", label: "Header text" },
      { name: "modalContentBg", label: "Content" },
      { name: "modalFooterBg", label: "Footer" },
      { name: "modalDividerColor", label: "Divider" },
      { name: "modalCloseButtonColor", label: "Close button" },
      { name: "modalAccentColor", label: "Accent" },
      { name: "modalHighlightColor", label: "Highlight" },
      { name: "modalTextColor", label: "Text" },
      { name: "modalOverlay", label: "Overlay" },
    ],
  },
  {
    title: "Logs & dock",
    colors: [
      { name: "logsBackground", label: "Logs background" },
      { name: "logsForeground", label: "Logs foreground" },
      { name: "logRowHoverBackground", label: "Log row hover" },
      { name: "dockHeadBackground", label: "Dock head" },
      { name: "dockInfoBackground", label: "Dock info" },
    ],
  },
  {
    title: "Cluster menu",
    colors: [
      { name: "clusterMenuBackground", label: "Background" },
      { name: "clusterMenuBorderColor", label: "Border" },
      { name: "clusterMenuCellBackground", label: "Cell background" },
      { name: "clusterMenuCellOutline", label: "Cell outline" },
      { name: "clusterSettingsBackground", label: "Settings" },
      { name: "addClusterIconColor", label: "Add cluster icon" },
    ],
  },
  {
    title: "Charts & misc",
    colors: [
      { name: "chartLiveBarBackground", label: "Live bar" },
      { name: "chartStripesColor", label: "Stripes" },
      { name: "chartCapacityColor", label: "Capacity" },
      { name: "pieChartDefaultColor", label: "Pie default" },
      { name: "lineProgressBackground", label: "Line progress" },
      { name: "iconActiveColor", label: "Active icon" },
      { name: "iconActiveBackground", label: "Active icon bg" },
      { name: "scrollBarColor", label: "Scrollbar" },
      { name: "scrollBarHoverColor", label: "Scrollbar hover" },
      { name: "linkColor", label: "Link" },
      { name: "linkHoverColor", label: "Link hover" },
      { name: "badgeBackgroundColor", label: "Badge" },
      { name: "boxShadow", label: "Box shadow" },
      { name: "halfGray", label: "Half gray" },
    ],
  },
  {
    title: "Greys",
    colors: [
      { name: "grey100", label: "grey100" },
      { name: "grey80", label: "grey80" },
      { name: "grey70", label: "grey70" },
      { name: "grey60", label: "grey60" },
      { name: "grey40", label: "grey40" },
      { name: "grey30", label: "grey30" },
      { name: "grey25", label: "grey25" },
      { name: "grey20", label: "grey20" },
      { name: "grey10", label: "grey10" },
      { name: "grey80Alpha85", label: "grey80 @ 85%" },
    ],
  },
  {
    title: "Helm docs",
    colors: [
      { name: "helmLogoBackground", label: "Logo bg" },
      { name: "helmStableRepo", label: "Stable repo" },
      { name: "helmIncubatorRepo", label: "Incubator repo" },
      { name: "helmDescriptionHr", label: "Hr" },
      { name: "helmDescriptionHeaders", label: "Headers" },
      { name: "helmDescriptionH6", label: "H6" },
      { name: "helmDescriptionBlockquoteColor", label: "Blockquote text" },
      { name: "helmDescriptionBlockquoteBorder", label: "Blockquote border" },
      { name: "helmDescriptionBlockquoteBackground", label: "Blockquote bg" },
      { name: "helmDescriptionTdBorder", label: "Td border" },
      { name: "helmDescriptionTrBackground", label: "Tr background" },
      { name: "helmDescriptionCodeBackground", label: "Code bg" },
      { name: "helmDescriptionPreBackground", label: "Pre bg" },
      { name: "helmDescriptionPreColor", label: "Pre text" },
    ],
  },
];

export const allColorNames: ReadonlyArray<string> = colorGroups.flatMap((g) => g.colors.map((c) => c.name));

export const colorLabels: Readonly<Record<string, string>> = Object.fromEntries(
  colorGroups.flatMap((g) => g.colors.map((c) => [c.name, c.label])),
);
