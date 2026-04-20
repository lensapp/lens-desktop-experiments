import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { navigateToSharedUrlInjectionToken } from "@lensapp/share-common";
import type { ParsedLensUrl } from "./parse-lens-url";

export type NavigateFromLensUrl = (parsed: ParsedLensUrl) => Promise<void>;

export const navigateFromLensUrlInjectionToken = getInjectionToken<NavigateFromLensUrl>({
  id: "navigate-from-lens-url",
});

const navigateFromLensUrlInjectable = getInjectable({
  id: "url-navigation-and-sharing-navigate-from-lens-url",

  instantiate:
    (di): NavigateFromLensUrl =>
    async (parsed) => {
      const navigateToSharedUrl = await di.inject(navigateToSharedUrlInjectionToken);

      await navigateToSharedUrl(parsed.connectionType, parsed.clusterSpecifier, parsed.search, parsed.tail);
    },

  injectionToken: navigateFromLensUrlInjectionToken,
});

export default navigateFromLensUrlInjectable;
