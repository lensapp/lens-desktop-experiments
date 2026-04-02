import { getInjectable } from "@lensapp/injectable";
import { lensIdLicenseServiceInjectionToken, substituteDisabledFeaturesChannel } from "@lensapp/lens-id";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";

export type SetLensIdLicenseDisabledFeatures = (disabledFeatures: string[]) => void;

export const setLensIdLicenseDisabledFeaturesInjectable = getInjectable({
  id: "set-lens-id-license-disabled-features",

  instantiate: (di): SetLensIdLicenseDisabledFeatures => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);
    const lensIdLicenseService = di.inject(lensIdLicenseServiceInjectionToken);

    return (disabledFeatures) => {
      lensIdLicenseService.get()?.substituteLicenseDisabledFeatures(disabledFeatures);

      sendMessageToChannel(substituteDisabledFeaturesChannel, disabledFeatures);
    };
  },
});
