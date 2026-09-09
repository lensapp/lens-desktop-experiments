import { getFeature, registerInjectablesFromModules } from "@k8slens/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { messagingFeature } from "@lensapp/messaging";
import { telemetryFeature } from "@lensapp/telemetry";
import { elementComponentFeature } from "@k8slens/element-components";
import { useSyncInjectFeature } from "@lensapp/use-sync-inject";

export const telemetryDevToolFeature = getFeature({
  id: "telemetry-dev-tool",
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [telemetryFeature, messagingFeature, elementComponentFeature, useSyncInjectFeature],
});
