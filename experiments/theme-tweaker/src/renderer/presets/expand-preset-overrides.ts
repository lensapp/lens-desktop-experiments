/**
 * Most Lens surfaces (hotbar, dock, sidebar, tabs, navigator, tables …) read their color
 * through the element-components SCSS map at `_shared/colors.scss`, which exposes only a
 * narrow set of `var(--<token>)` lookups: the grey scale plus a few accents.
 *
 * Semantic slots like `backgroundPrimary` / `mainBackground` are aliases that get resolved
 * to `grey80` / `grey100` in JS *before* a `var()` reference is emitted — so overriding the
 * semantic slot alone leaves the actual surfaces untouched.
 *
 * `expandPresetOverrides` plugs that gap by fanning each semantic override out to its
 * matching grey token (and a few well-known synonyms) when the preset hasn't already set
 * them explicitly.
 */

/** semantic slot → grey slot it actually flows through */
const semanticToGrey: ReadonlyArray<[string, string]> = [
  ["mainBackground", "grey100"],
  ["backgroundPrimary", "grey80"],
  ["modalContentBg", "grey70"],
  ["borderColor", "grey60"],
  ["sidebarBackground", "grey40"],
  ["borderFaintColor", "grey30"],
  ["textColorPrimary", "grey20"],
  ["textColorAccent", "grey10"],
];

/** semantic slot → other semantic slots that should follow when not overridden explicitly */
const semanticSynonyms: ReadonlyArray<[string, ReadonlyArray<string>]> = [
  ["mainBackground", ["backgroundSecondary", "layoutBackground"]],
  ["backgroundPrimary", ["itemListToolbarBackground", "tableHeaderBackground", "modalHeaderBg", "modalFooterBg"]],
  ["borderColor", ["layoutBorderColor", "modalDividerColor"]],
  ["borderFaintColor", ["inputControlBorder", "columnResizerColor", "hrColor"]],
  ["textColorPrimary", ["textColorTertiary", "settingsColor", "modalTextColor", "modalSubtleHeaderColor"]],
  ["textColorAccent", ["modalAccentColor"]],
];

export const expandPresetOverrides = (
  overrides: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> => {
  const result: Record<string, string> = { ...overrides };

  for (const [semantic, grey] of semanticToGrey) {
    if (result[semantic] && !(grey in overrides)) {
      result[grey] = result[semantic];
    }
  }

  for (const [semantic, synonyms] of semanticSynonyms) {
    if (!result[semantic]) {
      continue;
    }

    for (const syn of synonyms) {
      if (!(syn in overrides)) {
        result[syn] = result[semantic];
      }
    }
  }

  return result;
};
