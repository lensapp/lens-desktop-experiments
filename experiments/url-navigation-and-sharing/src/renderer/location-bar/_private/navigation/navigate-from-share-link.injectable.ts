import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { getClusterAddressHash, getClusterServerChannel } from "@lensapp/share-common";
import { requestClusterActivationInjectionToken, waitForClusterToBeReadyInjectionToken } from "@lensapp/cluster-common";
import { requestChannelRequesterForInjectionToken } from "@lensapp/messaging";
import { entitiesWithKindInjectionToken } from "@lensapp/entity-aggregator";
import type { Entity } from "@lensapp/entity-aggregator";
import { isSpacesClusterEntity } from "@lensapp/lens-spaces";
import { kubernetesClusterContextKind } from "@lensapp/kubernetes-cluster-context";
import {
  createSelfLinkForKubeResourceInjectionToken,
  kubeResourcesForKindInjectionToken,
  resourceApiBaseForKindInjectionToken,
} from "@lensapp/kube-resource";
import { showPersistedKubeResourceTabInjectionToken } from "@lensapp/kubernetes-resources";
import {
  hideKubeObjectDetailsPanelInjectionToken,
  showKubeObjectDetailsPanelInjectionToken,
} from "@lensapp/kube-object-details-panel";
import { selectNamespacesInjectionToken } from "@lensapp/selecting-namespaces";
import { parseKubeApi } from "@lensapp/kube-api";
import { isLoaded } from "@lensapp/loadable-utilities";
import { when } from "mobx";
import { connectionTypeForSlug } from "../_shared/source-slug";
import type { ParsedShareLink } from "../_shared/parse-share-link";
import { resolveKubeResourceKindOrUndefinedInjectionToken } from "../monorepo-adapters/resolve-kube-resource-kind-or-undefined.injectable";
import { resolveClusterScopedSegments } from "../_shared/parse-location-bar-input";
import { makeIsKindNamespaced } from "../_shared/is-plural-namespaced";

export type ShareLinkNavigationFailure =
  | {
      readonly kind: "cluster-not-found";
      readonly sourceSlug: string;
      readonly clusterSpecifier: string;
    }
  | {
      readonly kind: "resource-type-not-found";
      readonly resourcePluralName: string;
    };

export type NavigateFromShareLink = (parsed: ParsedShareLink) => Promise<ShareLinkNavigationFailure | undefined>;

export const navigateFromShareLinkInjectionToken = getInjectionToken<NavigateFromShareLink>({
  id: "navigate-from-share-link",
});

const clusterEntityRegistration = {
  apiVersion: "entity.k8slens.dev/v1",
  kind: kubernetesClusterContextKind,
};

// Matches the share-common navigator's cluster-resolution logic but runs it
// up-front so we can surface a visible "not found" error to the user instead
// of letting `navigateToSharedUrl` silently no-op. Once the cluster is known
// we bypass that navigator entirely and drive tab + namespace + details
// ourselves — it only opens a tab and relies on URL parameters the renderer
// doesn't reliably read here, so we'd lose the detail panel otherwise.
const navigateFromShareLinkInjectable = getInjectable({
  id: "url-navigation-and-sharing-navigate-from-share-link",

  instantiate: (di): NavigateFromShareLink => {
    const requestChannelRequesterFor = di.inject(requestChannelRequesterForInjectionToken);
    const getClusterServer = requestChannelRequesterFor(getClusterServerChannel);
    const clusterEntities = di.inject(entitiesWithKindInjectionToken, clusterEntityRegistration);
    const resolveKindOrUndefined = di.inject(resolveKubeResourceKindOrUndefinedInjectionToken);

    const findTargetEntity = async (
      connectionType: "direct" | "teamwork",
      clusterSpecifier: string,
    ): Promise<Entity | undefined> => {
      const current = clusterEntities.get();

      if (connectionType === "teamwork") {
        return current.find((entity) => isSpacesClusterEntity(entity) && entity.metadata.id === clusterSpecifier);
      }

      for (const entity of current) {
        if (isSpacesClusterEntity(entity)) {
          continue;
        }

        const serverUrl = await getClusterServer(entity.metadata.id);

        if (serverUrl && getClusterAddressHash(serverUrl) === clusterSpecifier) {
          return entity;
        }
      }

      return undefined;
    };

    return async (parsed) => {
      const connectionType = connectionTypeForSlug(parsed.sourceSlug);
      const targetEntity = await findTargetEntity(connectionType, parsed.clusterSpecifier);

      if (!targetEntity) {
        return {
          kind: "cluster-not-found",
          sourceSlug: parsed.sourceSlug,
          clusterSpecifier: parsed.clusterSpecifier,
        };
      }

      const clusterId = targetEntity.metadata.id;

      if (!parsed.resourcePluralName) {
        return undefined;
      }

      const kind = resolveKindOrUndefined(parsed.resourcePluralName);

      if (!kind) {
        return { kind: "resource-type-not-found", resourcePluralName: parsed.resourcePluralName };
      }

      const isKindNamespaced = makeIsKindNamespaced((plural) => {
        const sampleKind = resolveKindOrUndefined(plural);

        if (!sampleKind) {
          return undefined;
        }

        const state = di.inject(kubeResourcesForKindInjectionToken.for(sampleKind), clusterId).get();

        if (!isLoaded(state)) {
          return undefined;
        }

        return state.value;
      });

      const resolved = resolveClusterScopedSegments(
        {
          clusterName: parsed.clusterSpecifier,
          resourcePluralName: parsed.resourcePluralName,
          namespaces: parsed.namespaces,
          resourceName: parsed.resourceName,
        },
        isKindNamespaced,
      );

      const requestClusterActivation = di.inject(requestClusterActivationInjectionToken);
      const waitForClusterToBeReady = di.inject(waitForClusterToBeReadyInjectionToken);

      await requestClusterActivation({ clusterId });
      await waitForClusterToBeReady(clusterId);

      const showTab = await di.inject(showPersistedKubeResourceTabInjectionToken.for(kind), clusterId);
      const tabId = await showTab();

      if (resolved.namespaces && resolved.namespaces.length > 0) {
        const selectNamespaces = await di.inject(selectNamespacesInjectionToken, { clusterId, tabId });

        selectNamespaces([...resolved.namespaces]);
      }

      if (resolved.resourceName) {
        const createSelfLink = di.inject(createSelfLinkForKubeResourceInjectionToken.for(kind));
        const apiBase = di.inject(resourceApiBaseForKindInjectionToken.for(kind));
        const parsedApi = parseKubeApi(apiBase);

        if (parsedApi) {
          const singleConcreteNamespace =
            resolved.namespaces?.length === 1 && resolved.namespaces[0] !== "*" ? resolved.namespaces[0] : undefined;

          let namespaceFromLoadedSample: string | undefined;

          if (singleConcreteNamespace === undefined) {
            const resourcesComputed = di.inject(kubeResourcesForKindInjectionToken.for(kind), clusterId);

            // Capture the matching sample *inside* the `when` predicate — once
            // `when` disposes, the resource map's last observer may fall away
            // and `onBecomeUnobserved` clears it synchronously, so any read
            // after the await would see an empty loading state.
            await when(
              () => {
                const state = resourcesComputed.get();

                if (!isLoaded(state)) {
                  return false;
                }

                const match = state.value.find((resource) => resource.metadata.name === resolved.resourceName);

                namespaceFromLoadedSample = (match?.metadata as { readonly namespace?: string } | undefined)?.namespace;

                return true;
              },
              { timeout: 10_000 },
            ).catch(() => undefined);
          }

          const selfLink = createSelfLink({
            apiVersion: parsedApi.apiVersionWithGroup,
            name: resolved.resourceName,
            namespace: singleConcreteNamespace ?? namespaceFromLoadedSample,
          });

          const showDetails = await di.inject(showKubeObjectDetailsPanelInjectionToken, tabId);

          showDetails({ clusterId, selfLink });
        }
      } else {
        const hideDetails = await di.inject(hideKubeObjectDetailsPanelInjectionToken, tabId);

        hideDetails();
      }

      return undefined;
    };
  },

  injectionToken: navigateFromShareLinkInjectionToken,
});

export default navigateFromShareLinkInjectable;
