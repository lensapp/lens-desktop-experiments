import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { navigateToSharedUrlInjectionToken } from "@lensapp/share-common";
import { connectionTypeForSource, denormalizeSourceSlug } from "./source-slug";
import type { ParsedShareLink } from "./parse-share-link";

export type ShareLinkNavigationFailure = {
  readonly kind: "cluster-not-found";
  readonly sourceSlug: string;
  readonly clusterSpecifier: string;
};

export type NavigateFromShareLink = (parsed: ParsedShareLink) => Promise<ShareLinkNavigationFailure | undefined>;

export const navigateFromShareLinkInjectionToken = getInjectionToken<NavigateFromShareLink>({
  id: "navigate-from-share-link",
});

const navigateFromShareLinkInjectable = getInjectable({
  id: "url-navigation-and-sharing-navigate-from-share-link",

  instantiate:
    (di): NavigateFromShareLink =>
    async (parsed) => {
      const navigateToSharedUrl = await di.inject(navigateToSharedUrlInjectionToken);
      const sourceId = denormalizeSourceSlug(parsed.sourceSlug);
      const connectionType = connectionTypeForSource(sourceId);
      const tail = parsed.resourcePluralName ? `/${parsed.resourcePluralName}` : "";

      // The share-common navigator resolves (connectionType, clusterSpecifier)
      // → clusterId via main. It returns `void` either way, so we can't tell
      // a missing cluster from a successful open; worth revisiting once a
      // public error channel exists.
      await navigateToSharedUrl(connectionType, parsed.clusterSpecifier, {}, tail);

      return undefined;
    },

  injectionToken: navigateFromShareLinkInjectionToken,
});

export default navigateFromShareLinkInjectable;
