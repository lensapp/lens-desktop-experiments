import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { clustersInjectionToken } from "@lensapp/cluster-source";
import { type KubeResourceKind, kubeResourceKindByPluralNameInjectionToken } from "@lensapp/kube-resource";
import { showPersistedKubeResourceTabInjectionToken } from "@lensapp/kubernetes-resources";
import { selectNamespacesInjectionToken, allNamespacesSelectedValue } from "@lensapp/selecting-namespaces";
import { type ParsedLocationBarInput, resolveLocationSegments } from "./parse-location-bar-input";

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

      const kindByPlural = new Map<string, KubeResourceKind>();

      const canResolvePlural = (pluralName: string): boolean => {
        if (kindByPlural.has(pluralName)) {
          return true;
        }

        try {
          kindByPlural.set(pluralName, di.inject(kubeResourceKindByPluralNameInjectionToken.for(pluralName)));
          return true;
        } catch {
          return false;
        }
      };

      const resolved = resolveLocationSegments(input, canResolvePlural);

      if (!resolved.resourcePluralName) {
        return undefined;
      }

      if (!canResolvePlural(resolved.resourcePluralName)) {
        return { kind: "resource-type-not-found", resourcePluralName: resolved.resourcePluralName };
      }

      const kind = kindByPlural.get(resolved.resourcePluralName) as KubeResourceKind;

      const showTab = await di.inject(showPersistedKubeResourceTabInjectionToken.for(kind), cluster.id);
      const tabId = await showTab();

      if (resolved.namespace) {
        const selectNamespaces = await di.inject(selectNamespacesInjectionToken, {
          clusterId: cluster.id,
          tabId,
        });

        const normalized =
          resolved.namespace === allNamespacesSelectedValue ? allNamespacesSelectedValue : resolved.namespace;

        selectNamespaces([normalized]);
      }

      return undefined;
    },

  injectionToken: navigateFromLocationInputInjectionToken,
});

export default navigateFromLocationInputInjectable;
