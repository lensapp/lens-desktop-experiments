import { getFeature } from "@lensapp/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import { aiEngineFeature } from "@lensapp/ai-engine";
import { aiProviderInstancesFeature } from "@lensapp/ai-provider-instances";
import { persistedStateFeature } from "@lensapp/persisted-state";
import { environmentVariablesFeature } from "@lensapp/environment-variables";
import { useSyncInjectFeature } from "@lensapp/use-sync-inject";

export const aiProviderForAzure2Feature = getFeature({
  id: "ai-provider-for-azure-2",
  tags: ["public", "renderer", "business"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [
    aiEngineFeature,
    aiProviderInstancesFeature,
    persistedStateFeature,
    environmentVariablesFeature,
    useSyncInjectFeature,
  ],
});
