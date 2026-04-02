import { getFeature } from "@lensapp/feature-core";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { devToolsFeature } from "../../in-general/feature";
import { elementComponentFeature } from "@lensapp/element-components";
import { messagingFeature } from "@lensapp/messaging";

export const featureTogglerFeature = getFeature({
  id: "feature-toggler",
  tags: ["public", "renderer", "business"],

  register: (di) => {
    registerInjectablesFromModules(di, modulesWithInjectables);
  },

  dependencies: [devToolsFeature, elementComponentFeature, messagingFeature],
});
