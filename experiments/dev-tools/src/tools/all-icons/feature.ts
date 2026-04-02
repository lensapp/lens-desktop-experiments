import { getFeature } from "@lensapp/feature-core";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { iconFeature } from "@lensapp/icon";
import { devToolsFeature } from "../../in-general/feature";
import { elementComponentFeature } from "@lensapp/element-components";

export const allIconsDevToolFeature = getFeature({
  id: "all-icons-dev-tool",
  tags: ["public", "renderer", "business"],

  register: (di) => {
    registerInjectablesFromModules(di, modulesWithInjectables);
  },

  dependencies: [devToolsFeature, iconFeature, elementComponentFeature],
});
