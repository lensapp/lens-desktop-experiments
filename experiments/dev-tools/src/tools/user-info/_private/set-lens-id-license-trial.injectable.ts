import { getInjectable } from "@lensapp/injectable";
import { lensIdLicenseServiceInjectionToken, substituteTrialChannel } from "@lensapp/lens-id";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";

export type SetLensIdLicenseTrial = (trial: boolean) => void;

export const setLensIdLicenseTrialInjectable = getInjectable({
  id: "set-lens-id-license-trial",

  instantiate: (di): SetLensIdLicenseTrial => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);
    const lensIdLicenseService = di.inject(lensIdLicenseServiceInjectionToken);

    return (trial) => {
      lensIdLicenseService.get()?.substituteLicenseTrial(trial);

      sendMessageToChannel(substituteTrialChannel, trial);
    };
  },
});
