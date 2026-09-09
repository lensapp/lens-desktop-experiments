import { getFeature, registerInjectablesFromModules } from "@k8slens/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { elementComponentFeature } from "@k8slens/element-components";
import { lensIdFeature } from "@lensapp/lens-id";
import { persistedStateFeature } from "@lensapp/persisted-state";
import { selectFeature } from "@lensapp/select";
import { inputFeature } from "@lensapp/input";
import { withAutoDisposeFeature } from "@lensapp/with-auto-dispose";
import { devToolsFeature } from "../../in-general/feature";

export const userInfoDevToolFeature = getFeature({
  id: "user-info-dev-tool",
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
