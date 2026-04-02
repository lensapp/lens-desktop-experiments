import { getInjectable } from "@lensapp/injectable";
import { computed, type IComputedValue, reaction, runInAction } from "mobx";
import { lensIdLicenseInjectionToken } from "@lensapp/lens-id";
import type { Enableable } from "@lensapp/composable-responsibilities";
import { uniq } from "lodash";
import { involveInGracefulCloseOfApplicationInjectionToken } from "@lensapp/with-auto-dispose";
import { persistedFeaturesStateInjectable } from "./persisted-features-state.injectable";

export type EnableableFeature = Enableable & {
  name: string;
};

export const featuresInjectable = getInjectable({
  id: "lens-id-features-for-dev-tool",

  instantiate: (di): IComputedValue<EnableableFeature[]> => {
    const lensIdLicense = di.inject(lensIdLicenseInjectionToken);
    const involveInClose = di.inject(involveInGracefulCloseOfApplicationInjectionToken);
    const persistedFeatures = di.inject(persistedFeaturesStateInjectable);

    // Watch for changes and accumulate feature names into persisted set
    // Note: involveInClose only dispose on application shutdown
    involveInClose(
      "stop-watching-license-feature-changes",
      reaction(
        () => lensIdLicense.get()?.features || [],
        (currentFeatures) => {
          runInAction(() => {
            const allFeaturesEverSeen = persistedFeatures.reactive.current();

            if (allFeaturesEverSeen) {
              currentFeatures.forEach((feature) => {
                allFeaturesEverSeen.add(feature);
              });
            }
          });
        },
        { fireImmediately: true },
      ),
    );

    return computed(() => {
      const allFeaturesEverSeen = persistedFeatures.reactive.current();

      if (!allFeaturesEverSeen) {
        return [];
      }

      const allFeatures = uniq([...Array.from(allFeaturesEverSeen), ...(lensIdLicense.get()?.features || [])]).sort();

      return allFeatures.map((feature) => ({
        name: feature,
        isEnabled: lensIdLicense.get()?.features.includes(feature) ?? false,
      }));
    });
  },
});
