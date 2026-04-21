import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { getClusterAddressHash, getClusterServerChannel } from "@lensapp/share-common";
import { clusterSourceInjectionToken } from "@lensapp/cluster-source";
import { requestChannelRequesterForInjectionToken } from "@lensapp/messaging";
import { isSpacesClusterEntity } from "@lensapp/lens-spaces";
import type { Entity } from "@lensapp/entity-aggregator";
import { slugifyNavigatorName, teamworkSourceSlug } from "./source-slug";

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

const directFallbackSlug = "direct";

// A cluster entity carries `metadata.parentId` equal to the ClusterSource
// entity id, which in turn matches `clusterSourceInjectionToken`'s `meta.id`
// (see `consume-cluster-sources-from-renderer.injectable.ts`). That gives us a
// direct lookup from cluster entity → navigator source → navigator name, which
// we slugify to keep the share link's prefix visually consistent with the
// sidebar label users already recognise ("eks", "local-kubeconfigs", …).
const resolveClusterShareInfoInjectable = getInjectable({
  id: "url-navigation-and-sharing-resolve-cluster-share-info",

  instantiate: (di): ResolveClusterShareInfo => {
    const requestChannelRequesterFor = di.inject(requestChannelRequesterForInjectionToken);
    const getClusterServer = requestChannelRequesterFor(getClusterServerChannel);
    const clusterSources = di.injectManyWithMeta(clusterSourceInjectionToken);

    const navigatorSlugFor = (entity: Entity): string => {
      const parentId = entity.metadata.parentId;

      if (!parentId) {
        return directFallbackSlug;
      }

      const match = clusterSources.find(({ meta }) => meta.id === parentId);

      return match ? slugifyNavigatorName(match.instance.name) : directFallbackSlug;
    };

    return async (entity) => {
      if (isSpacesClusterEntity(entity)) {
        return {
          kind: "ok",
          info: {
            sourceSlug: teamworkSourceSlug,
            connectionType: "teamwork",
            clusterSpecifier: entity.metadata.id,
          },
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
          sourceSlug: navigatorSlugFor(entity),
          connectionType: "direct",
          clusterSpecifier: getClusterAddressHash(serverUrl),
        },
      };
    };
  },

  injectionToken: resolveClusterShareInfoInjectionToken,
});

export default resolveClusterShareInfoInjectable;
