import type { SuggestionSegment } from "../../telemetry/location-bar-telemetry-event";

export type SuggestionSegmentViewInput = {
  readonly activeSegmentIndex: number;
  readonly resolvedIsClusterScoped: boolean;
};

export const suggestionSegmentForView = (view: SuggestionSegmentViewInput): SuggestionSegment => {
  if (view.activeSegmentIndex === 0) {
    return "cluster";
  }

  if (view.activeSegmentIndex === 1) {
    return "resource-type";
  }

  if (view.activeSegmentIndex === 2) {
    return view.resolvedIsClusterScoped ? "resource-name" : "namespace";
  }

  return "resource-name";
};
