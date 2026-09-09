import { getFeature, registerInjectablesFromModules } from "@k8slens/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { statusBarFeature } from "@lensapp/status-bar";

export const helloWorldRendererFeature = getFeature({
  id: "hello-world-renderer",
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [statusBarFeature],
});
