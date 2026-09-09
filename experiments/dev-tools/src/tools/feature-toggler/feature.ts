import { getFeature, registerInjectablesFromModules } from "@k8slens/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { devToolsFeature } from "../../in-general/feature";
import { elementComponentFeature } from "@k8slens/element-components";
import { messagingFeature } from "@lensapp/messaging";

export const featureTogglerFeature = getFeature({
  id: "feature-toggler",
  register: (di) => {
    registerInjectablesFromModules(di, modulesWithInjectables);
  },

  dependencies: [devToolsFeature, elementComponentFeature, messagingFeature],
});
