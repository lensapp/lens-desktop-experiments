import { getFeature } from "@lensapp/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import { useSyncInjectFeature } from "@lensapp/use-sync-inject";

export const devToolsFeature = getFeature({
  id: "development-tools",
  tags: ["public", "renderer", "technical"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [useSyncInjectFeature],
});
