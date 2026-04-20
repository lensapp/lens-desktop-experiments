import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { clustersInjectionToken } from "@lensapp/cluster-source";
import { type KubeResourceKind, kubeResourceKindByPluralNameInjectionToken } from "@lensapp/kube-resource";
import { showPersistedKubeResourceTabInjectionToken } from "@lensapp/kubernetes-resources";
import { selectNamespacesInjectionToken } from "@lensapp/selecting-namespaces";
import { createTabInjectionToken, findTabIdInjectionToken, selectTabByIdInjectionToken } from "@lensapp/main-view";
import { type ParsedLocationBarInput, resolveLocationSegments } from "./parse-location-bar-input";
import { tabTypeForLabel } from "./label-for-tab-type";

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
      const isJustFirstSegment =
        input.namespace === undefined && input.resourcePluralName === undefined && input.resourceName === undefined;

      if (isJustFirstSegment) {
        const tabType = tabTypeForLabel(input.clusterName);

        if (tabType) {
          const findTabId = await di.inject(findTabIdInjectionToken, tabType);
          const selectTabById = await di.inject(selectTabByIdInjectionToken);
          const existingTabId = findTabId(() => true);

          if (existingTabId) {
            selectTabById(existingTabId);
          } else {
            const createTab = await di.inject(createTabInjectionToken, tabType);
            selectTabById(createTab());
          }

          return undefined;
        }
      }

      const clusters = di.inject(clustersInjectionToken).get();
      const cluster = clusters.find((candidate) => candidate.name === input.clusterName);

      if (!cluster) {
        return { kind: "cluster-not-found", clusterName: input.clusterName };
      }

      const kindByPlural = new Map<string, KubeResourceKind>();

      // TODO: replace with a `kubeResourceKindByPluralNameOrUndefinedInjectionToken`
      // once contributed upstream. Until then, exceptions-as-existence-probe is the
      // only way to ask `@lensapp/kube-resource` "is this plural registered?", and
      // it risks swallowing genuine instantiate errors. Blocked on an additive
      // monorepo PR — see .knowledge/rules.md §2.
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

        selectNamespaces([resolved.namespace]);
      }

      return undefined;
    },

  injectionToken: navigateFromLocationInputInjectionToken,
});

export default navigateFromLocationInputInjectable;
