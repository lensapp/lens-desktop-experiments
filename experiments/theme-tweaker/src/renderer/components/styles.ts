import type { CSSProperties } from "react";

export const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    paddingBottom: 32,
  } satisfies CSSProperties,

  card: {
    background: "var(--contentColor)",
    border: "1px solid var(--borderColor)",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 2px var(--boxShadow)",
  } satisfies CSSProperties,

  cardHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  } satisfies CSSProperties,

  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--textColorAccent)",
    margin: 0,
    letterSpacing: 0.2,
  } satisfies CSSProperties,

  cardSubtitle: {
    fontSize: 12,
    color: "var(--textColorPrimary)",
    margin: 0,
    opacity: 0.85,
  } satisfies CSSProperties,

  heroCard: {
    background: "linear-gradient(135deg, var(--contentColor) 0%, var(--backgroundPrimary) 100%)",
    border: "1px solid var(--borderColor)",
    borderRadius: 12,
    padding: "22px 24px",
    boxShadow: "0 1px 2px var(--boxShadow)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  } satisfies CSSProperties,

  heroTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--textColorAccent)",
    margin: 0,
    marginBottom: 4,
  } satisfies CSSProperties,

  heroTag: {
    fontSize: 13,
    color: "var(--textColorPrimary)",
    margin: 0,
    lineHeight: 1.5,
  } satisfies CSSProperties,

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid var(--borderColor)",
    background: "var(--mainBackground)",
    color: "var(--textColorPrimary)",
    fontSize: 12,
  } satisfies CSSProperties,

  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    background: "var(--primary)",
    boxShadow: "0 0 0 1px var(--borderColor)",
  } satisfies CSSProperties,

  presetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  } satisfies CSSProperties,

  presetCard: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    border: "1px solid var(--borderColor)",
    background: "var(--mainBackground)",
    cursor: "pointer",
    transition: "transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
    textAlign: "left" as const,
  } satisfies CSSProperties,

  presetCardActive: {
    borderColor: "var(--primary)",
    boxShadow: "0 0 0 2px color-mix(in srgb, var(--primary) 35%, transparent)",
  } satisfies CSSProperties,

  presetSwatch: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 0,
    height: 44,
    borderRadius: 6,
    overflow: "hidden",
    border: "1px solid var(--borderFaintColor)",
  } satisfies CSSProperties,

  presetName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--textColorAccent)",
  } satisfies CSSProperties,

  presetAuthor: {
    fontSize: 11,
    color: "var(--textColorPrimary)",
    opacity: 0.8,
    marginTop: 2,
  } satisfies CSSProperties,

  savedRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 8,
    background: "var(--mainBackground)",
    border: "1px solid var(--borderFaintColor)",
  } satisfies CSSProperties,

  savedSwatchRow: {
    display: "flex",
    gap: 0,
    width: 80,
    height: 24,
    borderRadius: 4,
    overflow: "hidden",
    border: "1px solid var(--borderFaintColor)",
    flexShrink: 0,
  } satisfies CSSProperties,

  savedName: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--textColorAccent)",
    flex: 1,
  } satisfies CSSProperties,

  savedMeta: {
    fontSize: 11,
    color: "var(--textColorPrimary)",
    opacity: 0.7,
    marginLeft: 8,
  } satisfies CSSProperties,

  emptyText: {
    fontSize: 13,
    color: "var(--textColorPrimary)",
    padding: "12px 4px",
    lineHeight: 1.5,
    opacity: 0.85,
  } satisfies CSSProperties,

  groupTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    color: "var(--textColorAccent)",
    margin: "16px 0 10px",
    opacity: 0.9,
  } satisfies CSSProperties,

  groupFirstTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    color: "var(--textColorAccent)",
    margin: "0 0 10px",
    opacity: 0.9,
  } satisfies CSSProperties,

  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 8,
  } satisfies CSSProperties,

  colorRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 6,
    background: "var(--mainBackground)",
    border: "1px solid var(--borderFaintColor)",
  } satisfies CSSProperties,

  colorRowOverridden: {
    background: "color-mix(in srgb, var(--primary) 8%, var(--mainBackground))",
    borderColor: "color-mix(in srgb, var(--primary) 40%, var(--borderFaintColor))",
  } satisfies CSSProperties,

  colorSwatchInput: {
    width: 28,
    height: 28,
    padding: 0,
    border: "1px solid var(--borderColor)",
    borderRadius: 4,
    background: "transparent",
    cursor: "pointer",
    flexShrink: 0,
  } satisfies CSSProperties,

  colorLabel: {
    fontSize: 12,
    color: "var(--textColorPrimary)",
    flex: 1,
    minWidth: 0,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  } satisfies CSSProperties,

  hexInput: {
    width: 78,
    padding: "4px 6px",
    fontSize: 11,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    background: "var(--inputControlBackground)",
    border: "1px solid var(--inputControlBorder)",
    borderRadius: 4,
    color: "var(--textColorPrimary)",
    outline: "none" as const,
  } satisfies CSSProperties,

  resetSlot: {
    border: "none",
    background: "transparent",
    color: "var(--textColorPrimary)",
    cursor: "pointer",
    padding: "2px 4px",
    fontSize: 14,
    lineHeight: 1,
    borderRadius: 3,
    opacity: 0.7,
  } satisfies CSSProperties,

  actionsBar: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 10,
    alignItems: "center",
  } satisfies CSSProperties,

  nameInput: {
    flex: "0 0 220px",
    padding: "6px 10px",
    fontSize: 13,
    background: "var(--inputControlBackground)",
    border: "1px solid var(--inputControlBorder)",
    borderRadius: 6,
    color: "var(--textColorPrimary)",
    outline: "none" as const,
  } satisfies CSSProperties,

  searchInput: {
    width: "100%",
    maxWidth: 320,
    padding: "8px 12px",
    fontSize: 13,
    background: "var(--inputControlBackground)",
    border: "1px solid var(--inputControlBorder)",
    borderRadius: 6,
    color: "var(--textColorPrimary)",
    outline: "none" as const,
    marginBottom: 14,
  } satisfies CSSProperties,

  swatchCell: {
    display: "block",
  } satisfies CSSProperties,

  quickPaletteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 10,
  } satisfies CSSProperties,

  quickPaletteRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 8,
    background: "var(--mainBackground)",
    border: "1px solid var(--borderFaintColor)",
  } satisfies CSSProperties,

  quickPaletteSwatchInput: {
    width: 40,
    height: 40,
    padding: 0,
    border: "1px solid var(--borderColor)",
    borderRadius: 6,
    background: "transparent",
    cursor: "pointer",
    flexShrink: 0,
  } satisfies CSSProperties,

  quickPaletteText: {
    flex: 1,
    minWidth: 0,
  } satisfies CSSProperties,

  quickPaletteLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--textColorAccent)",
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  } satisfies CSSProperties,

  quickPaletteHint: {
    fontSize: 11,
    color: "var(--textColorPrimary)",
    opacity: 0.75,
    marginTop: 2,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  } satisfies CSSProperties,

  modeToggleContainer: {
    display: "inline-flex",
    padding: 4,
    gap: 2,
    background: "var(--mainBackground)",
    border: "1px solid var(--borderFaintColor)",
    borderRadius: 999,
  } satisfies CSSProperties,

  modeToggleButton: {
    appearance: "none" as const,
    border: "none",
    background: "transparent",
    color: "var(--textColorPrimary)",
    padding: "6px 18px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    transition: "background 120ms ease, color 120ms ease",
  } satisfies CSSProperties,

  modeToggleButtonActive: {
    background: "var(--primary)",
    color: "#ffffff",
    fontWeight: 600,
  } satisfies CSSProperties,

  filterBar: {
    display: "inline-flex",
    gap: 6,
  } satisfies CSSProperties,

  filterChip: {
    appearance: "none" as const,
    background: "var(--mainBackground)",
    color: "var(--textColorPrimary)",
    border: "1px solid var(--borderFaintColor)",
    borderRadius: 999,
    padding: "3px 12px",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
  } satisfies CSSProperties,

  filterChipActive: {
    background: "var(--primary)",
    color: "#ffffff",
    borderColor: "var(--primary)",
    fontWeight: 600,
  } satisfies CSSProperties,

  presetTypeBadgeDark: {
    display: "inline-block",
    marginLeft: 8,
    padding: "1px 6px",
    fontSize: 9,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
    borderRadius: 4,
    background: "color-mix(in srgb, var(--textColorAccent) 12%, transparent)",
    color: "var(--textColorAccent)",
    border: "1px solid color-mix(in srgb, var(--textColorAccent) 25%, transparent)",
    verticalAlign: "middle" as const,
  } satisfies CSSProperties,

  presetTypeBadgeLight: {
    display: "inline-block",
    marginLeft: 8,
    padding: "1px 6px",
    fontSize: 9,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
    borderRadius: 4,
    background: "color-mix(in srgb, var(--golden) 18%, transparent)",
    color: "var(--golden)",
    border: "1px solid color-mix(in srgb, var(--golden) 40%, transparent)",
    verticalAlign: "middle" as const,
  } satisfies CSSProperties,

  savedTypeBadgeDark: {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
    borderRadius: 4,
    background: "color-mix(in srgb, var(--textColorAccent) 12%, transparent)",
    color: "var(--textColorAccent)",
    border: "1px solid color-mix(in srgb, var(--textColorAccent) 25%, transparent)",
    flexShrink: 0,
  } satisfies CSSProperties,

  savedTypeBadgeLight: {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
    borderRadius: 4,
    background: "color-mix(in srgb, var(--golden) 18%, transparent)",
    color: "var(--golden)",
    border: "1px solid color-mix(in srgb, var(--golden) 40%, transparent)",
    flexShrink: 0,
  } satisfies CSSProperties,

  betaBadge: {
    display: "inline-block",
    marginLeft: 10,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    background: "color-mix(in srgb, var(--notice) 25%, transparent)",
    color: "var(--notice)",
    border: "1px solid color-mix(in srgb, var(--notice) 55%, transparent)",
    verticalAlign: "middle" as const,
  } satisfies CSSProperties,
};
