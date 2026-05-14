import { getFeature } from "@lensapp/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import { themeRendererFeature } from "@lensapp/theme-renderer";
import { applicationFeature } from "@lensapp/application";

export const themeTweakerRendererFeature = getFeature({
  id: "theme-tweaker-renderer",
  tags: ["public", "renderer", "business"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [themeRendererFeature, applicationFeature],
});
