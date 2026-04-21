import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { getClusterAddressHash, getClusterServerChannel } from "@lensapp/share-common";
import { clusterSourceInjectionToken } from "@lensapp/cluster-source";
import { getPredictableIdInjectionToken } from "@lensapp/utility-feature";
import { requestChannelRequesterForInjectionToken } from "@lensapp/messaging";
import { isSpacesClusterEntity } from "@lensapp/lens-spaces";
import type { Entity } from "@lensapp/entity-aggregator";
import { normalizeSourceSlug, teamworkSourceSlug } from "./source-slug";

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

// Direct clusters all land in the entity aggregator through the generic
// `consume-clusters` entity source, so `entity.metadata.sourceId` collapses to
// that single value for every cluster-source-derived cluster. To recover the
// real provider ("eks", "local-kubeconfig", etc.) we walk
// `clusterSourceInjectionToken` and find the source whose predictable child id
// matches the entity id — the same linkage `getPredictableId(sourceMeta.id,
// dto.id)` establishes when clusters are first consumed. Teamwork clusters
// are identified by the `isSpacesCluster` label and use a fixed slug.
const resolveClusterShareInfoInjectable = getInjectable({
  id: "url-navigation-and-sharing-resolve-cluster-share-info",

  instantiate: (di): ResolveClusterShareInfo => {
    const requestChannelRequesterFor = di.inject(requestChannelRequesterForInjectionToken);
    const getClusterServer = requestChannelRequesterFor(getClusterServerChannel);
    const getPredictableId = di.inject(getPredictableIdInjectionToken);
    const clusterSources = di.injectManyWithMeta(clusterSourceInjectionToken);

    const findSourceIdForEntity = (entity: Entity): string | undefined => {
      for (const { meta, instance } of clusterSources) {
        const dtos = instance.clusters.get();

        if (!dtos) {
          continue;
        }

        const match = dtos.find((dto) => getPredictableId(meta.id, dto.id) === entity.metadata.id);

        if (match) {
          return meta.id;
        }
      }

      return undefined;
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

      const sourceId = findSourceIdForEntity(entity);
      const sourceSlug = sourceId ? normalizeSourceSlug(sourceId) : "direct";

      return {
        kind: "ok",
        info: {
          sourceSlug,
          connectionType: "direct",
          clusterSpecifier: getClusterAddressHash(serverUrl),
        },
      };
    };
  },

  injectionToken: resolveClusterShareInfoInjectionToken,
});

export default resolveClusterShareInfoInjectable;
