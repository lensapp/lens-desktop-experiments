import type { CustomThemeMode } from "../state/custom-theme-mode.injectable";

export type ThemeTweakerTelemetryEvent =
  | { readonly action: "page-opened"; readonly params: { readonly activeThemeId: string } }
  | { readonly action: "mode-toggled"; readonly params: { readonly to: CustomThemeMode } }
  | {
      readonly action: "preset-applied";
      readonly params: { readonly presetId: string; readonly presetType: CustomThemeMode };
    }
  | { readonly action: "color-tweaked"; readonly params: { readonly mode: CustomThemeMode } }
  | {
      readonly action: "theme-saved";
      readonly params: { readonly mode: CustomThemeMode; readonly isOverwrite: boolean };
    }
  | { readonly action: "theme-deleted"; readonly params: { readonly mode: CustomThemeMode } }
  | { readonly action: "theme-applied-from-saved"; readonly params: { readonly mode: CustomThemeMode } };
