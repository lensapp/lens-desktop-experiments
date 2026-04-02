import { getFeature } from "@lensapp/feature-core";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { elementComponentFeature } from "@lensapp/element-components";
import { lensIdFeature } from "@lensapp/lens-id";
import { persistedStateFeature } from "@lensapp/persisted-state";
import { selectFeature } from "@lensapp/select";
import { inputFeature } from "@lensapp/input";
import { withAutoDisposeFeature } from "@lensapp/with-auto-dispose";
import { devToolsFeature } from "../../in-general/feature";

export const userInfoDevToolFeature = getFeature({
  id: "user-info-dev-tool",
  tags: ["public", "renderer", "business"],

  register: (di) => {
    registerInjectablesFromModules(di, modulesWithInjectables);
  },

  dependencies: [
    elementComponentFeature,
    lensIdFeature,
    persistedStateFeature,
    selectFeature,
    inputFeature,
    withAutoDisposeFeature,
    devToolsFeature,
  ],
});
