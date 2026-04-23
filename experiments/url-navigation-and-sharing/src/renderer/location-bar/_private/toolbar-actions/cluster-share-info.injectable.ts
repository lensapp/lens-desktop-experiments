import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { getClusterAddressHash, getClusterServerChannel } from "@lensapp/share-common";
import { clusterSourceInjectionToken } from "@lensapp/cluster-source";
import { getPredictableIdInjectionToken } from "@lensapp/utility-feature";
import { requestChannelRequesterForInjectionToken } from "@lensapp/messaging";
import { isSpacesClusterEntity } from "@lensapp/lens-spaces";
import type { Entity } from "@lensapp/entity-aggregator";
import { slugifyNavigatorName, teamworkSourceSlug } from "../_shared/source-slug";

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

// A cluster entity's `metadata.parentId` is the parent ClusterSource entity's
// `uid` — a v5 hash — not the cluster source injectable id, so we can't match
// on parentId directly. Instead we walk `clusterSourceInjectionToken` and find
// the source whose child id matches the cluster entity's `metadata.id`: the
// serve-clusters-of-cluster-source pipeline constructs that id as
// `getPredictableId(clusterSource.meta.id, dto.id)`, giving us an exact probe.
// Once matched, we slugify `instance.name` ("EKS", "Local Kubeconfigs") so the
// share link prefix mirrors the sidebar label users already recognise.
const resolveClusterShareInfoInjectable = getInjectable({
  id: "url-navigation-and-sharing-resolve-cluster-share-info",

  instantiate: (di): ResolveClusterShareInfo => {
    const requestChannelRequesterFor = di.inject(requestChannelRequesterForInjectionToken);
    const getClusterServer = requestChannelRequesterFor(getClusterServerChannel);
    const getPredictableId = di.inject(getPredictableIdInjectionToken);
    const clusterSources = di.injectManyWithMeta(clusterSourceInjectionToken);

    const navigatorSlugFor = (entity: Entity): string => {
      for (const { meta, instance } of clusterSources) {
        const dtos = instance.clusters.get();

        if (!dtos) {
          continue;
        }

        if (dtos.some((dto) => getPredictableId(meta.id, dto.id) === entity.metadata.id)) {
          return slugifyNavigatorName(instance.name);
        }
      }

      return directFallbackSlug;
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
