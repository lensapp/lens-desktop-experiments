import { getInjectable } from "@lensapp/injectable";
import { computed, type IComputedValue } from "mobx";
import { lensIdLicenseInjectionToken } from "@lensapp/lens-id";

export const disabledFeaturesInjectable = getInjectable({
  id: "lens-id-disabled-features-for-dev-tool",

  instantiate: (di): IComputedValue<string[]> => {
    const lensIdLicense = di.inject(lensIdLicenseInjectionToken);

    return computed(() => lensIdLicense.get()?.disabledFeatures ?? []);
  },
});
