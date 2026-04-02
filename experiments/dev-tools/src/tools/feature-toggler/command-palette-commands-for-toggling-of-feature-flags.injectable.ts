import { getInjectable } from "@lensapp/injectable";
import { commandsInjectionToken } from "@lensapp/command-palette-renderer";
import { computed } from "mobx";
import { pipeline } from "@lensapp/fp";
import { map } from "lodash/fp";
import { computedInjectManyWithMetaInjectionToken } from "@lensapp/injectable-extension-for-mobx";
import { featureFlagInjectionToken } from "@lensapp/feature-core";
import { toggleFeatureFlagInjectable } from "./_private/toggle-feature-flag/toggle-feature-flag.injectable";

export const commandPaletteCommandsForTogglingOfFeatureFlagsInjectable = getInjectable({
  id: "command-palette-commands-for-toggling-of-feature-flags",

  instantiate: (di) => {
    const featureFlags = di.inject(computedInjectManyWithMetaInjectionToken)(featureFlagInjectionToken);
    const toggleFeatureFlag = di.inject(toggleFeatureFlagInjectable);

    return computed(() =>
      pipeline(
        featureFlags.get(),

        map(({ meta: { id: featureFlagId } }) => ({
          id: featureFlagId,

          title: computed(() => `Toggle feature-flag: ${featureFlagId}`),

          action: () => {
            toggleFeatureFlag(featureFlagId);
          },
        })),
      ),
    );
  },

  injectionToken: commandsInjectionToken,
});
