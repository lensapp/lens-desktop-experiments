import { getFeature } from "@lensapp/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import { topBarFeature } from "@lensapp/top-bar";
import { kubernetesResourcesFeature } from "@lensapp/kubernetes-resources";
import { mainViewFeature } from "@lensapp/main-view";
import { selectingNamespacesFeature } from "@lensapp/selecting-namespaces";
import { kubeObjectDetailsPanelFeature } from "@lensapp/kube-object-details-panel";
import { clusterCommonFeature } from "@lensapp/cluster-common";
import { clusterSourceFeature } from "@lensapp/cluster-source";
import { kubeResourceFeature } from "@lensapp/kube-resource";
import { elementComponentFeature } from "@lensapp/element-components";
import { iconFeature } from "@lensapp/icon";
import { messagingFeature } from "@lensapp/messaging";
import { utilityFeature } from "@lensapp/utility-feature";
import { electronFeature } from "@lensapp/electron";
import { notificationsFeature } from "@lensapp/notifications";
import { telemetryFeature } from "@lensapp/telemetry";
import { varsFeature } from "@lensapp/vars";
import { lensSpacesFeature } from "@lensapp/lens-spaces";

export const urlNavigationAndSharingRendererFeature = getFeature({
  id: "url-navigation-and-sharing-renderer",
  tags: ["public", "renderer", "business"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [
    topBarFeature,
    kubernetesResourcesFeature,
    mainViewFeature,
    selectingNamespacesFeature,
    kubeObjectDetailsPanelFeature,
    clusterCommonFeature,
    clusterSourceFeature,
    kubeResourceFeature,
    elementComponentFeature,
    iconFeature,
    messagingFeature,
    utilityFeature,
    electronFeature,
    notificationsFeature,
    telemetryFeature,
    varsFeature,
    lensSpacesFeature,
  ],
});
