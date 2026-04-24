import { Div } from "@lensapp/element-components";
import { clusterDisplayNameInjectionToken } from "@lensapp/cluster-common";
import type { Entity } from "@lensapp/entity-aggregator";
import { currentKubeObjectInDetailsOrUndefinedInjectionToken } from "@lensapp/kube-object-details-panel";
import {
  areAllNamespacesSelectedInjectionToken,
  selectedNamespacesForFilteringInjectionToken,
} from "@lensapp/selecting-namespaces";
import { useInjectAsReactive } from "@lensapp/use-inject-as-reactive";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import { synthesizeClusterBreadcrumb, synthesizeEditableClusterPath } from "./_shared/synthesize-breadcrumb";
import { buildShareNamespaces } from "./_shared/namespaces-for-share-link";
import { isKnownClusterScopedPlural } from "./_shared/is-plural-namespaced";
import { pluralNameFromResourcePath } from "./_shared/plural-name-from-resource-path";
import { EditableLocationBar } from "./editable-location-bar";
import { ClusterToolbarActions } from "./toolbar-actions/cluster-toolbar-actions";

const allNamespacesSelectedValue = "*";

type ClusterBreadcrumbProps = {
  readonly tabId: string;
  readonly clusterId: string;
  readonly entity: Entity;
  readonly resourcePath: string;
};

export const ClusterBreadcrumb = observer(({ tabId, clusterId, entity, resourcePath }: ClusterBreadcrumbProps) => {
  const displayName = useSyncInject(clusterDisplayNameInjectionToken, clusterId).get();
  const filteredNamespaces = useInjectAsReactive(selectedNamespacesForFilteringInjectionToken, { tabId, clusterId })
    .get()
    ?.get();
  const areAllNamespacesSelected = useInjectAsReactive(areAllNamespacesSelectedInjectionToken, { tabId, clusterId })
    .get()
    ?.get();
  const kubeObject = useInjectAsReactive(currentKubeObjectInDetailsOrUndefinedInjectionToken, tabId).get()?.get();

  const namespaces = areAllNamespacesSelected ? [allNamespacesSelectedValue] : filteredNamespaces;

  const breadcrumbInput = {
    clusterName: displayName ?? entity.metadata.name,
    namespaces,
    resourcePath,
    resourceName: kubeObject?.metadata.name,
  };

  const segments = synthesizeClusterBreadcrumb(breadcrumbInput);
  const editableSegments = synthesizeEditableClusterPath(breadcrumbInput);

  const resourcePluralName = pluralNameFromResourcePath(resourcePath);
  const objectNamespace = kubeObject?.metadata.namespace;
  const resourceIsClusterScoped = resourcePluralName !== undefined && isKnownClusterScopedPlural(resourcePluralName);
  const shareNamespaces = resourceIsClusterScoped ? undefined : buildShareNamespaces(namespaces, objectNamespace);

  return (
    <Div $flex={{ direction: "horizontal", verticalAlign: "center" }} $overflow="hidden" $style={{ minWidth: 0 }}>
      <Div
        $flex={{ direction: "horizontal", verticalAlign: "center" }}
        $overflow="hidden"
        $style={{ minWidth: 0, flex: 1 }}
      >
        <EditableLocationBar segments={segments} editableSegments={editableSegments} />
      </Div>
      <ClusterToolbarActions
        entity={entity}
        resourcePluralName={resourcePluralName}
        namespaces={shareNamespaces}
        resourceName={kubeObject?.metadata.name}
        resourceSelfLink={kubeObject?.metadata.selfLink}
      />
    </Div>
  );
});
