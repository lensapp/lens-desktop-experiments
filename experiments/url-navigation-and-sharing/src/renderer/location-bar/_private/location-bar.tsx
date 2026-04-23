import {
  activeClusterEntityForSelectedTabInjectionToken,
  selectedClusterTabInjectionToken,
} from "@lensapp/kubernetes-resources";
import { selectedTabReactiveInjectionToken } from "@lensapp/main-view";
import { useInjectAsReactive } from "@lensapp/use-inject-as-reactive";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import { labelForTabType } from "./_shared/label-for-tab-type";
import { ClusterBreadcrumb } from "./cluster-breadcrumb";
import { EditableLocationBar } from "./editable-location-bar";

const defaultNonClusterLabel = "Lens";

export const LocationBar = observer(() => {
  const activeClusterEntity = useSyncInject(activeClusterEntityForSelectedTabInjectionToken).get();
  const selectedClusterTab = useInjectAsReactive(selectedClusterTabInjectionToken).get()?.get();
  const selectedTab = useSyncInject(selectedTabReactiveInjectionToken).get();

  if (!activeClusterEntity || !selectedClusterTab) {
    const label = selectedTab ? labelForTabType(selectedTab.type) : defaultNonClusterLabel;

    return <EditableLocationBar segments={[label]} />;
  }

  return (
    <ClusterBreadcrumb
      tabId={selectedClusterTab.tabId}
      clusterId={selectedClusterTab.clusterId}
      entity={activeClusterEntity}
      resourcePath={selectedClusterTab.kubeResource}
    />
  );
});
