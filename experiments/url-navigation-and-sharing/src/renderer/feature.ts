import { getFeature } from "@lensapp/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import { topBarFeature } from "@lensapp/top-bar";

export const urlNavigationAndSharingRendererFeature = getFeature({
  id: "url-navigation-and-sharing-renderer",
  tags: ["public", "renderer", "business"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [topBarFeature],
});
