import { getFeature, registerInjectablesFromModules } from "@k8slens/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { useSyncInjectFeature } from "@lensapp/use-sync-inject";

export const devToolsFeature = getFeature({
  id: "development-tools",
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [useSyncInjectFeature],
});
