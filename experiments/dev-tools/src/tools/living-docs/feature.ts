import { getFeature } from "@lensapp/feature-core";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { elementComponentFeature } from "@lensapp/element-components";
import { livingDocsFeature } from "@lensapp/living-docs";
import { devToolsFeature } from "../../in-general/feature";

export const livingDocsDevToolFeature = getFeature({
  id: "living-docs-dev-tool",
  tags: ["public", "renderer", "business"],

  register: (di) => {
    registerInjectablesFromModules(di, modulesWithInjectables);
  },

  dependencies: [devToolsFeature, elementComponentFeature, livingDocsFeature],
});
