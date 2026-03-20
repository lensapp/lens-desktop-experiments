import { getFeature } from "@lensapp/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import { messagingFeature } from "@lensapp/messaging";
import { applicationFeature } from "@lensapp/application";

export const helloWorldMainFeature = getFeature({
  id: "hello-world-main",
  tags: ["public", "main", "technical"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [messagingFeature, applicationFeature],
});