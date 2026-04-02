import { getFeature } from "@lensapp/feature-core";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { messagingFeature } from "@lensapp/messaging";
import { telemetryFeature } from "@lensapp/telemetry";
import { elementComponentFeature } from "@lensapp/element-components";
import { useSyncInjectFeature } from "@lensapp/use-sync-inject";

export const telemetryDevToolFeature = getFeature({
  id: "telemetry-dev-tool",
  tags: ["public", "renderer", "business"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [telemetryFeature, messagingFeature, elementComponentFeature, useSyncInjectFeature],
});
