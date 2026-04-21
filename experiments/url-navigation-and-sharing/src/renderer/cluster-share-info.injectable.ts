import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { clusterSourceInjectionToken } from "@lensapp/cluster-source";
import { getPredictableIdInjectionToken } from "@lensapp/utility-feature";
import { getClusterAddressHash, getClusterServerChannel } from "@lensapp/share-common";
import { requestChannelRequesterForInjectionToken } from "@lensapp/messaging";
import { connectionTypeForSource, normalizeSourceSlug } from "./source-slug";

export type ClusterShareInfo = {
  readonly sourceId: string;
  readonly sourceSlug: string;
  readonly connectionType: "direct" | "teamwork";
  readonly clusterSpecifier: string;
};

export type ResolveClusterShareInfo = (clusterId: string) => Promise<ClusterShareInfo | undefined>;

export const resolveClusterShareInfoInjectionToken = getInjectionToken<ResolveClusterShareInfo>({
  id: "resolve-cluster-share-info",
});

// Walks every registered cluster source and recomputes
// `getPredictableId(source.meta.id, dto.id)` for each (source, dto) pair to
// find which source owns the given global cluster id. This mirrors how the
// core app constructs cluster ids — see
// `serve-clusters-of-cluster-source-to-main.injectable.ts` — and is the only
// way to recover the owning source without a dedicated public token.
const resolveClusterShareInfoInjectable = getInjectable({
  id: "url-navigation-and-sharing-resolve-cluster-share-info",

  instantiate: (di): ResolveClusterShareInfo => {
    const getPredictableId = di.inject(getPredictableIdInjectionToken);
    const requestChannelRequesterFor = di.inject(requestChannelRequesterForInjectionToken);
    const getClusterServer = requestChannelRequesterFor(getClusterServerChannel);

    return async (clusterId) => {
      const sources = di.injectManyWithMeta(clusterSourceInjectionToken);

      for (const source of sources) {
        const clusters = source.instance.clusters.get();

        if (!clusters) {
          continue;
        }

        const matchingDto = clusters.find((dto) => getPredictableId(source.meta.id, dto.id) === clusterId);

        if (!matchingDto) {
          continue;
        }

        const connectionType = connectionTypeForSource(source.meta.id);
        const sourceSlug = normalizeSourceSlug(source.meta.id);

        if (connectionType === "teamwork") {
          return {
            sourceId: source.meta.id,
            sourceSlug,
            connectionType,
            clusterSpecifier: matchingDto.id,
          };
        }

        const serverUrl = await getClusterServer(clusterId);

        if (!serverUrl) {
          return undefined;
        }

        return {
          sourceId: source.meta.id,
          sourceSlug,
          connectionType,
          clusterSpecifier: getClusterAddressHash(serverUrl),
        };
      }

      return undefined;
    };
  },

  injectionToken: resolveClusterShareInfoInjectionToken,
});

export default resolveClusterShareInfoInjectable;
