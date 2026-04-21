import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { getClusterAddressHash, getClusterServerChannel } from "@lensapp/share-common";
import { requestChannelRequesterForInjectionToken } from "@lensapp/messaging";
import { isSpacesClusterEntity } from "@lensapp/lens-spaces";
import type { Entity } from "@lensapp/entity-aggregator";
import { normalizeSourceSlug } from "./source-slug";

export type ClusterShareInfo = {
  readonly sourceSlug: string;
  readonly connectionType: "direct" | "teamwork";
  readonly clusterSpecifier: string;
};

export type ResolveClusterShareInfoResult =
  | { readonly kind: "ok"; readonly info: ClusterShareInfo }
  | { readonly kind: "error"; readonly message: string };

export type ResolveClusterShareInfo = (entity: Entity) => Promise<ResolveClusterShareInfoResult>;

export const resolveClusterShareInfoInjectionToken = getInjectionToken<ResolveClusterShareInfo>({
  id: "resolve-cluster-share-info",
});

// The active cluster entity carries its source id in `metadata.sourceId`, so
// we don't need to walk `clusterSourceInjectionToken` and recompute
// predictable ids to find the owning source. For teamwork clusters, the
// entity's own `metadata.id` is already the cross-instance stable specifier
// (see pod-share's `toStableIdAcrossDifferentLensInstances`). For direct
// clusters, we ask main for the server URL and hash it — same flow pod-share
// uses today.
const resolveClusterShareInfoInjectable = getInjectable({
  id: "url-navigation-and-sharing-resolve-cluster-share-info",

  instantiate: (di): ResolveClusterShareInfo => {
    const requestChannelRequesterFor = di.inject(requestChannelRequesterForInjectionToken);
    const getClusterServer = requestChannelRequesterFor(getClusterServerChannel);

    return async (entity) => {
      const connectionType = isSpacesClusterEntity(entity) ? "teamwork" : "direct";
      const sourceSlug = normalizeSourceSlug(entity.metadata.sourceId);

      if (connectionType === "teamwork") {
        return {
          kind: "ok",
          info: { sourceSlug, connectionType, clusterSpecifier: entity.metadata.id },
        };
      }

      const serverUrl = await getClusterServer(entity.metadata.id);

      if (!serverUrl) {
        return {
          kind: "error",
          message: `Could not resolve server address for cluster "${entity.metadata.name}"`,
        };
      }

      return {
        kind: "ok",
        info: {
          sourceSlug,
          connectionType,
          clusterSpecifier: getClusterAddressHash(serverUrl),
        },
      };
    };
  },

  injectionToken: resolveClusterShareInfoInjectionToken,
});

export default resolveClusterShareInfoInjectable;
