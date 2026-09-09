import { getFeature, registerInjectablesFromModules } from "@k8slens/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { elementComponentFeature } from "@k8slens/element-components";
import { livingDocsFeature } from "@lensapp/living-docs";
import { devToolsFeature } from "../../in-general/feature";

export const livingDocsDevToolFeature = getFeature({
  id: "living-docs-dev-tool",
  register: (di) => {
    registerInjectablesFromModules(di, modulesWithInjectables);
  },

  dependencies: [devToolsFeature, elementComponentFeature, livingDocsFeature],
});
