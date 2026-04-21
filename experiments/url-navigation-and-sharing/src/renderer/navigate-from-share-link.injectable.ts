import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import {
  getClusterAddressHash,
  getClusterServerChannel,
  navigateToSharedUrlInjectionToken,
} from "@lensapp/share-common";
import { requestChannelRequesterForInjectionToken } from "@lensapp/messaging";
import { entitiesWithKindInjectionToken } from "@lensapp/entity-aggregator";
import type { Entity } from "@lensapp/entity-aggregator";
import { isSpacesClusterEntity } from "@lensapp/lens-spaces";
import { kubernetesClusterContextKind } from "@lensapp/kubernetes-cluster-context";
import { connectionTypeForSlug } from "./source-slug";
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

const clusterEntityRegistration = {
  apiVersion: "entity.k8slens.dev/v1",
  kind: kubernetesClusterContextKind,
};

// The share-common navigator returns `Promise<void>` and silently no-ops with
// only a log line when the cluster specifier doesn't resolve. We pre-walk the
// cluster entities ourselves so we can surface a visible error to the user
// before falling through to the same navigator pod-share uses.
const navigateFromShareLinkInjectable = getInjectable({
  id: "url-navigation-and-sharing-navigate-from-share-link",

  instantiate: (di): NavigateFromShareLink => {
    const requestChannelRequesterFor = di.inject(requestChannelRequesterForInjectionToken);
    const getClusterServer = requestChannelRequesterFor(getClusterServerChannel);
    const clusterEntities = di.inject(entitiesWithKindInjectionToken, clusterEntityRegistration);

    const findTargetEntity = async (
      connectionType: "direct" | "teamwork",
      clusterSpecifier: string,
    ): Promise<Entity | undefined> => {
      const current = clusterEntities.get();

      if (connectionType === "teamwork") {
        return current.find((entity) => isSpacesClusterEntity(entity) && entity.metadata.id === clusterSpecifier);
      }

      for (const entity of current) {
        if (isSpacesClusterEntity(entity)) {
          continue;
        }

        const serverUrl = await getClusterServer(entity.metadata.id);

        if (serverUrl && getClusterAddressHash(serverUrl) === clusterSpecifier) {
          return entity;
        }
      }

      return undefined;
    };

    return async (parsed) => {
      const navigateToSharedUrl = await di.inject(navigateToSharedUrlInjectionToken);
      const connectionType = connectionTypeForSlug(parsed.sourceSlug);
      const targetEntity = await findTargetEntity(connectionType, parsed.clusterSpecifier);

      if (!targetEntity) {
        return {
          kind: "cluster-not-found",
          sourceSlug: parsed.sourceSlug,
          clusterSpecifier: parsed.clusterSpecifier,
        };
      }

      const tail = parsed.resourcePluralName ? `/${parsed.resourcePluralName}` : "";

      await navigateToSharedUrl(connectionType, parsed.clusterSpecifier, {}, tail);

      return undefined;
    };
  },

  injectionToken: navigateFromShareLinkInjectionToken,
});

export default navigateFromShareLinkInjectable;
