import { getInjectable } from "@lensapp/injectable";
import { leftItemInjectionToken } from "@lensapp/top-bar";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { useInjectAsReactive } from "@lensapp/use-inject-as-reactive";
import { activeClusterEntityForSelectedTabInjectionToken } from "@lensapp/kubernetes-resources";
import { selectedClusterTabInjectionToken } from "@lensapp/kubernetes-resources";
import { selectedNamespacesForFilteringInjectionToken } from "@lensapp/selecting-namespaces";
import { currentKubeObjectInDetailsOrUndefinedInjectionToken } from "@lensapp/kube-object-details-panel";
import { observer } from "mobx-react";
import React from "react";
import { synthesizeBreadcrumb } from "./synthesize-breadcrumb";

const locationBarOrderNumber = 100;
const segmentSeparator = "/";

type LocationBarViewProps = {
  readonly segments: readonly string[];
};

const LocationBarView = ({ segments }: LocationBarViewProps) => (
  <div
    data-location-bar-test
    style={{
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      fontFamily: "monospace",
      gap: 6,
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    {segments.map((segment, index) => (
      <React.Fragment key={`${index}-${segment}`}>
        {index > 0 && (
          <span aria-hidden style={{ opacity: 0.5 }}>
            {segmentSeparator}
          </span>
        )}
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {segment}
        </span>
      </React.Fragment>
    ))}
  </div>
);

type ClusterBreadcrumbProps = {
  readonly tabId: string;
  readonly clusterId: string;
  readonly clusterName: string;
  readonly kubeResource: string;
};

const ClusterBreadcrumb = observer(({ tabId, clusterId, clusterName, kubeResource }: ClusterBreadcrumbProps) => {
  const namespaces = useInjectAsReactive(selectedNamespacesForFilteringInjectionToken, { tabId, clusterId }).get()?.get();
  const kubeObject = useInjectAsReactive(currentKubeObjectInDetailsOrUndefinedInjectionToken, tabId).get()?.get();

  const segments = synthesizeBreadcrumb({
    clusterName,
    namespaces,
    resourceType: kubeResource,
    resourceName: kubeObject?.metadata.name,
  });

  return <LocationBarView segments={segments} />;
});

const LocationBar = observer(() => {
  const activeClusterEntity = useSyncInject(activeClusterEntityForSelectedTabInjectionToken).get();
  const selectedClusterTab = useInjectAsReactive(selectedClusterTabInjectionToken).get()?.get();

  if (!activeClusterEntity || !selectedClusterTab) {
    return <LocationBarView segments={synthesizeBreadcrumb({
      clusterName: undefined,
      namespaces: undefined,
      resourceType: undefined,
      resourceName: undefined,
    })} />;
  }

  return (
    <ClusterBreadcrumb
      tabId={selectedClusterTab.tabId}
      clusterId={selectedClusterTab.clusterId}
      clusterName={activeClusterEntity.metadata.name}
      kubeResource={selectedClusterTab.kubeResource}
    />
  );
});

const locationBarInjectable = getInjectable({
  id: "url-navigation-and-sharing-location-bar",

  instantiate: () => ({
    Component: LocationBar,
    orderNumber: locationBarOrderNumber,
  }),

  injectionToken: leftItemInjectionToken,
});

export default locationBarInjectable;
