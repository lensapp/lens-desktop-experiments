import { getFeature, registerInjectablesFromModules } from "@k8slens/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { devToolsFeature } from "../../in-general/feature";
import { elementComponentFeature } from "@k8slens/element-components";

export const allIconsDevToolFeature = getFeature({
  id: "all-icons-dev-tool",
  register: (di) => {
    registerInjectablesFromModules(di, modulesWithInjectables);
  },

  dependencies: [devToolsFeature, elementComponentFeature],
});
