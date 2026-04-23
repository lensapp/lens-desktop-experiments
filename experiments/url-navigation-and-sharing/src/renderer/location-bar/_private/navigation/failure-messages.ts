import type { NavigationFailure } from "./navigate-from-location-input.injectable";
import type { ShareLinkNavigationFailure } from "./navigate-from-share-link.injectable";

export const failureMessage = (failure: NavigationFailure): string => {
  switch (failure.kind) {
    case "cluster-not-found":
      return `Cluster "${failure.clusterName}" not found`;
    case "resource-type-not-found":
      return `Resource type "${failure.resourcePluralName}" not found`;
  }
};

export const shareLinkFailureMessage = (failure: ShareLinkNavigationFailure): string => {
  switch (failure.kind) {
    case "cluster-not-found":
      return `Cluster from "${failure.sourceSlug}" link not found in this Lens`;
    case "resource-type-not-found":
      return `Resource type "${failure.resourcePluralName}" not found`;
  }
};
