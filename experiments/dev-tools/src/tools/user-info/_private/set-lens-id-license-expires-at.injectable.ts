import { getInjectable } from "@lensapp/injectable";
import { lensIdLicenseServiceInjectionToken, substituteExpiresAtChannel } from "@lensapp/lens-id";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";

export type SetLensIdLicenseExpiresAt = (expiresAt: number) => void;

export const setLensIdLicenseExpiresAtInjectable = getInjectable({
  id: "set-lens-id-license-expires-at",

  instantiate: (di): SetLensIdLicenseExpiresAt => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);
    const lensIdLicenseService = di.inject(lensIdLicenseServiceInjectionToken);

    return (expiresAt) => {
      lensIdLicenseService.get()?.substituteLicenseExpiresAt(expiresAt);

      sendMessageToChannel(substituteExpiresAtChannel, expiresAt);
    };
  },
});
