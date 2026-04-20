/**
 * Maps a built-in main-view tab type to a human-readable breadcrumb label.
 * Used when the current tab is not a Kubernetes resource tab (e.g. Preferences,
 * Welcome) so the location bar can still show *something* informative.
 *
 * Unknown tab types fall back to the raw type id so the user still sees
 * a stable identifier rather than a silent "Lens" label.
 *
 * TODO: replace with an additive `tabLabelInjectionToken` that each
 * tab-owning feature contributes to, then injectMany here. Blocked on
 * an additive monorepo PR — see .knowledge/rules.md §2.
 */
const labelsByTabType: Readonly<Record<string, string>> = {
  welcome: "Welcome",
  preferences: "Preferences",
  "release-notes": "Release notes",
  "space-settings": "Space settings",
  "premium-features": "Premium features",
  "kubernetes-resource-kind": "Kubernetes",
};

export const labelForTabType = (tabType: string): string => labelsByTabType[tabType] ?? tabType;
