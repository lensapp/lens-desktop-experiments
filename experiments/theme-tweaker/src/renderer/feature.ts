import { getFeature, registerInjectablesFromModules } from "@k8slens/feature-core";
import modulesWithInjectables from "./**/*.injectable.(ts|tsx)";
import { themeRendererFeature } from "@lensapp/theme-renderer";
import { applicationFeature } from "@lensapp/application";
import { useSyncInjectFeature } from "@lensapp/use-sync-inject";
import { useInjectAsReactiveFeature } from "@lensapp/use-inject-as-reactive";
import { elementComponentFeature } from "@k8slens/element-components";
import { inputFeature } from "@lensapp/input";
import { presentationalComponentsFeature } from "@lensapp/presentational-components";
import { persistedStateFeature } from "@lensapp/persisted-state";
import { telemetryFeature } from "@lensapp/telemetry";

export const themeTweakerRendererFeature = getFeature({
  id: "theme-tweaker-renderer",
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
    telemetryFeature,
  ],
});
