import { getInjectable } from "@lensapp/injectable";
import { clustersInjectionToken } from "@lensapp/cluster-source";
import { clusterDisplayNameInjectionToken } from "@lensapp/cluster-common";
import { type IComputedValue, computed } from "mobx";

export type ClusterDescriptor = {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
};

export const clusterDescriptorsInjectable = getInjectable({
  id: "url-navigation-and-sharing-cluster-descriptors",

  instantiate: (di): IComputedValue<readonly ClusterDescriptor[]> => {
    const clusters = di.inject(clustersInjectionToken);

    return computed(() =>
      clusters.get().map((cluster) => {
        const displayName = di.inject(clusterDisplayNameInjectionToken, cluster.id).get();

        return {
          id: cluster.id,
          name: cluster.name,
          displayName: displayName ?? cluster.name,
        };
      }),
    );
  },
});

export const findClusterByDisplayNameOrName = (
  descriptors: readonly ClusterDescriptor[],
  typed: string,
): ClusterDescriptor | undefined =>
  descriptors.find((descriptor) => descriptor.displayName === typed) ??
  descriptors.find((descriptor) => descriptor.name === typed);
