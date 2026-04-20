import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { clustersInjectionToken } from "@lensapp/cluster-source";
import { type KubeResourceKind, kubeResourceKindByPluralNameInjectionToken } from "@lensapp/kube-resource";
import { showPersistedKubeResourceTabInjectionToken } from "@lensapp/kubernetes-resources";
import { selectNamespacesInjectionToken, allNamespacesSelectedValue } from "@lensapp/selecting-namespaces";
import type { ParsedLocationBarInput } from "./parse-location-bar-input";

export type NavigationFailure =
  | { readonly kind: "cluster-not-found"; readonly clusterName: string }
  | { readonly kind: "resource-type-not-found"; readonly resourcePluralName: string };

export type NavigateFromLocationInput = (input: ParsedLocationBarInput) => Promise<NavigationFailure | undefined>;

export const navigateFromLocationInputInjectionToken = getInjectionToken<NavigateFromLocationInput>({
  id: "navigate-from-location-input",
});

const navigateFromLocationInputInjectable = getInjectable({
  id: "url-navigation-and-sharing-navigate-from-location-input",

  instantiate:
    (di): NavigateFromLocationInput =>
    async (input) => {
      const clusters = di.inject(clustersInjectionToken).get();
      const cluster = clusters.find((candidate) => candidate.name === input.clusterName);

      if (!cluster) {
        return { kind: "cluster-not-found", clusterName: input.clusterName };
      }

      if (!input.resourcePluralName) {
        return undefined;
      }

      let kind: KubeResourceKind;

      try {
        kind = di.inject(kubeResourceKindByPluralNameInjectionToken.for(input.resourcePluralName));
      } catch {
        return { kind: "resource-type-not-found", resourcePluralName: input.resourcePluralName };
      }

      const showTab = await di.inject(showPersistedKubeResourceTabInjectionToken.for(kind), cluster.id);
      const tabId = await showTab();

      if (input.namespace) {
        const selectNamespaces = await di.inject(selectNamespacesInjectionToken, {
          clusterId: cluster.id,
          tabId,
        });

        const normalized =
          input.namespace === allNamespacesSelectedValue ? allNamespacesSelectedValue : input.namespace;

        selectNamespaces([normalized]);
      }

      return undefined;
    },

  injectionToken: navigateFromLocationInputInjectionToken,
});

export default navigateFromLocationInputInjectable;
