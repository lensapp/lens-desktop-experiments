import { getInjectable } from "@lensapp/injectable";
import { lensIdLicenseServiceInjectionToken, substituteFeaturesChannel } from "@lensapp/lens-id";
import type { EnableableFeature } from "./features.injectable";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";

export type SetLensIdLicenseFeatures = (features: EnableableFeature[]) => void;

export const setLensIdLicenseFeaturesInjectable = getInjectable({
  id: "set-lens-id-license",

  instantiate: (di): SetLensIdLicenseFeatures => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);
    const lensIdLicenseService = di.inject(lensIdLicenseServiceInjectionToken);

    return (features) => {
      const substitutedFeatures = features.filter((feature) => feature.isEnabled).map((feature) => feature.name);

      lensIdLicenseService.get()?.substituteLicenseFeatures(substitutedFeatures);

      sendMessageToChannel(substituteFeaturesChannel, substitutedFeatures);
    };
  },
});
