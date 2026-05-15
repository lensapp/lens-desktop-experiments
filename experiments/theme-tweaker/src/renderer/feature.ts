import { getFeature } from "@lensapp/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { registerInjectablesFromModules } from "@lensapp/utilities";
import { themeRendererFeature } from "@lensapp/theme-renderer";
import { applicationFeature } from "@lensapp/application";
import { useSyncInjectFeature } from "@lensapp/use-sync-inject";
import { useInjectAsReactiveFeature } from "@lensapp/use-inject-as-reactive";
import { elementComponentFeature } from "@lensapp/element-components";
import { inputFeature } from "@lensapp/input";
import { presentationalComponentsFeature } from "@lensapp/presentational-components";
import { persistedStateFeature } from "@lensapp/persisted-state";

export const themeTweakerRendererFeature = getFeature({
  id: "theme-tweaker-renderer",
  tags: ["public", "renderer", "business"],
  register: (di) => registerInjectablesFromModules(di, modulesWithInjectables),
  dependencies: [
    themeRendererFeature,
    applicationFeature,
    useSyncInjectFeature,
    useInjectAsReactiveFeature,
    elementComponentFeature,
    inputFeature,
    presentationalComponentsFeature,
    persistedStateFeature,
  ],
});
