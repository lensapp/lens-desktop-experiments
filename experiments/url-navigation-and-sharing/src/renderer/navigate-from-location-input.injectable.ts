import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { requestClusterActivationInjectionToken, waitForClusterToBeReadyInjectionToken } from "@lensapp/cluster-common";
import { clusterDescriptorsInjectable, findClusterByDisplayNameOrName } from "./cluster-descriptors.injectable";
import {
  createSelfLinkForKubeResourceInjectionToken,
  type KubeResourceKind,
  resourceApiBaseForKindInjectionToken,
} from "@lensapp/kube-resource";
import { showPersistedKubeResourceTabInjectionToken } from "@lensapp/kubernetes-resources";
import {
  hideKubeObjectDetailsPanelInjectionToken,
  showKubeObjectDetailsPanelInjectionToken,
} from "@lensapp/kube-object-details-panel";
import { selectNamespacesInjectionToken } from "@lensapp/selecting-namespaces";
import { createTabInjectionToken, findTabIdInjectionToken, selectTabByIdInjectionToken } from "@lensapp/main-view";
import { parseKubeApi } from "@lensapp/kube-api";
import { type ParsedLocationBarInput, resolveLocationSegments } from "./parse-location-bar-input";
import { tabTypeForLabel } from "./label-for-tab-type";
import { resolveKubeResourceKindOrUndefinedInjectionToken } from "./resolve-kube-resource-kind-or-undefined.injectable";

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
      const resolveKindOrUndefined = di.inject(resolveKubeResourceKindOrUndefinedInjectionToken);
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

      const clusterDescriptors = di.inject(clusterDescriptorsInjectable);
      const cluster = findClusterByDisplayNameOrName(clusterDescriptors.get(), input.clusterName);

      if (!cluster) {
        return { kind: "cluster-not-found", clusterName: input.clusterName };
      }

      const kindByPlural = new Map<string, KubeResourceKind>();

      const canResolvePlural = (pluralName: string): boolean => {
        if (kindByPlural.has(pluralName)) {
          return true;
        }

        const kind = resolveKindOrUndefined(pluralName);

        if (!kind) {
          return false;
        }

        kindByPlural.set(pluralName, kind);

        return true;
      };

      const resolved = resolveLocationSegments(input, canResolvePlural);

      if (!resolved.resourcePluralName) {
        return undefined;
      }

      if (!canResolvePlural(resolved.resourcePluralName)) {
        return { kind: "resource-type-not-found", resourcePluralName: resolved.resourcePluralName };
      }

      const kind = kindByPlural.get(resolved.resourcePluralName) as KubeResourceKind;

      const requestClusterActivation = di.inject(requestClusterActivationInjectionToken);
      const waitForClusterToBeReady = di.inject(waitForClusterToBeReadyInjectionToken);

      await requestClusterActivation({ clusterId: cluster.id });
      await waitForClusterToBeReady(cluster.id);

      const showTab = await di.inject(showPersistedKubeResourceTabInjectionToken.for(kind), cluster.id);
      const tabId = await showTab();

      if (resolved.namespace) {
        const selectNamespaces = await di.inject(selectNamespacesInjectionToken, {
          clusterId: cluster.id,
          tabId,
        });

        selectNamespaces([resolved.namespace]);
      }

      if (resolved.resourceName) {
        const createSelfLink = di.inject(createSelfLinkForKubeResourceInjectionToken.for(kind));
        const apiBase = di.inject(resourceApiBaseForKindInjectionToken.for(kind));
        const parsedApi = parseKubeApi(apiBase);

        if (parsedApi) {
          const selfLink = createSelfLink({
            apiVersion: parsedApi.apiVersionWithGroup,
            name: resolved.resourceName,
            namespace: resolved.namespace,
          });

          const showDetails = await di.inject(showKubeObjectDetailsPanelInjectionToken, tabId);

          showDetails({ clusterId: cluster.id, selfLink });
        }
      } else {
        const hideDetails = await di.inject(hideKubeObjectDetailsPanelInjectionToken, tabId);

        hideDetails();
      }

      return undefined;
    },

  injectionToken: navigateFromLocationInputInjectionToken,
});

export default navigateFromLocationInputInjectable;
