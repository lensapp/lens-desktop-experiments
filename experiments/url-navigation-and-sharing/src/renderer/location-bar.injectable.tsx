import { getInjectable } from "@lensapp/injectable";
import { leftItemInjectionToken } from "@lensapp/top-bar";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { useInjectAsReactive } from "@lensapp/use-inject-as-reactive";
import {
  activeClusterEntityForSelectedTabInjectionToken,
  selectedClusterTabInjectionToken,
} from "@lensapp/kubernetes-resources";
import { selectedTabReactiveInjectionToken } from "@lensapp/main-view";
import { selectedNamespacesForFilteringInjectionToken } from "@lensapp/selecting-namespaces";
import { currentKubeObjectInDetailsOrUndefinedInjectionToken } from "@lensapp/kube-object-details-panel";
import { clusterDisplayNameInjectionToken } from "@lensapp/cluster-common";
import { Div, Span } from "@lensapp/element-components";
import { observer } from "mobx-react";
import React from "react";
import { synthesizeClusterBreadcrumb } from "./synthesize-breadcrumb";
import { labelForTabType } from "./label-for-tab-type";

const locationBarOrderNumber = 100;
const segmentSeparator = "/";
const defaultNonClusterLabel = "Lens";

type LocationBarViewProps = {
  readonly segments: readonly string[];
};

const LocationBarView = ({ segments }: LocationBarViewProps) => (
  <Div
    data-location-bar-test
    $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
    $padding={{ horizontal: "s" }}
    $overflow="hidden"
    $style={{ fontFamily: "monospace", minWidth: 0 }}
  >
    {segments.map((segment, index) => (
      <React.Fragment key={index}>
        {index > 0 && (
          <Span aria-hidden $style={{ opacity: 0.5 }}>
            {segmentSeparator}
          </Span>
        )}
        <Span $font={{ noWrap: true, textOverflow: "ellipsis" }} $overflow="hidden">
          {segment}
        </Span>
      </React.Fragment>
    ))}
  </Div>
);

type ClusterBreadcrumbProps = {
  readonly tabId: string;
  readonly clusterId: string;
  readonly fallbackClusterName: string;
  readonly resourcePath: string;
};

const ClusterBreadcrumb = observer(
  ({ tabId, clusterId, fallbackClusterName, resourcePath }: ClusterBreadcrumbProps) => {
    const displayName = useSyncInject(clusterDisplayNameInjectionToken, clusterId).get();
    const namespaces = useInjectAsReactive(selectedNamespacesForFilteringInjectionToken, { tabId, clusterId })
      .get()
      ?.get();
    const kubeObject = useInjectAsReactive(currentKubeObjectInDetailsOrUndefinedInjectionToken, tabId).get()?.get();

    const segments = synthesizeClusterBreadcrumb({
      clusterName: displayName ?? fallbackClusterName,
      namespaces,
      resourcePath,
      resourceName: kubeObject?.metadata.name,
    });

    return <LocationBarView segments={segments} />;
  },
);

const LocationBar = observer(() => {
  const activeClusterEntity = useSyncInject(activeClusterEntityForSelectedTabInjectionToken).get();
  const selectedClusterTab = useInjectAsReactive(selectedClusterTabInjectionToken).get()?.get();
  const selectedTab = useSyncInject(selectedTabReactiveInjectionToken).get();

  if (!activeClusterEntity || !selectedClusterTab) {
    const label = selectedTab ? labelForTabType(selectedTab.type) : defaultNonClusterLabel;

    return <LocationBarView segments={[label]} />;
  }

  return (
    <ClusterBreadcrumb
      tabId={selectedClusterTab.tabId}
      clusterId={selectedClusterTab.clusterId}
      fallbackClusterName={activeClusterEntity.metadata.name}
      resourcePath={selectedClusterTab.kubeResource}
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
