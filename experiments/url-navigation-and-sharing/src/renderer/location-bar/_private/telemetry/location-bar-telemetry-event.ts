export type SuggestionSegment = "cluster" | "resource-type" | "namespace" | "resource-name";

export type NavigationTargetShape = {
  readonly hasResourceType: boolean;
  readonly namespaceCount: number;
  readonly isAllNamespaces: boolean;
  readonly hasResourceName: boolean;
};

export type ShareTargetShape = {
  readonly hasResourceType: boolean;
  readonly namespaceCount: number;
  readonly hasResourceName: boolean;
};

export type LocationBarTelemetryEvent =
  | { readonly action: "edit-opened"; readonly params: { readonly trigger: "click" | "shortcut" } }
  | { readonly action: "suggestion-picked"; readonly params: { readonly segment: SuggestionSegment } }
  | { readonly action: "navigated-from-input"; readonly params: NavigationTargetShape }
  | {
      readonly action: "navigated-from-share-link";
      readonly params: NavigationTargetShape & { readonly connectionType: "direct" | "teamwork" };
    }
  | {
      readonly action: "navigation-failed";
      readonly params: { readonly source: "input" | "share-link"; readonly kind: string };
    }
  | { readonly action: "share-link-copied"; readonly params: ShareTargetShape }
  | {
      readonly action: "system-share-opened";
      readonly params: { readonly hasResourceType: boolean; readonly hasResourceName: boolean };
    };
