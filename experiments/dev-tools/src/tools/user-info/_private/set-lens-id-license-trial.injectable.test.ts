import { createContainer, getInjectable, type DiContainer } from "@lensapp/injectable";
import { computed } from "mobx";
import { setLensIdLicenseTrialInjectable, type SetLensIdLicenseTrial } from "./set-lens-id-license-trial.injectable";
import { lensIdLicenseServiceInjectionToken, substituteTrialChannel } from "@lensapp/lens-id";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";
import type { LicenseService } from "@lensapp/lens-platform-extension-sdk";

describe("setLensIdLicenseTrialInjectable", () => {
  let di: DiContainer;
  let sendMessageToChannelMock: jest.Mock;
  let substituteLicenseTrialMock: jest.Mock;

  beforeEach(() => {
    di = createContainer("irrelevant");

    sendMessageToChannelMock = jest.fn();
    substituteLicenseTrialMock = jest.fn();

    // Register stub implementations for injection tokens
    di.register(
      getInjectable({
        id: "lens-id-license-service-stub",
        instantiate: () => computed(() => undefined),
        injectionToken: lensIdLicenseServiceInjectionToken,
      }),
    );

    di.register(
      getInjectable({
        id: "send-message-to-channel-stub",
        instantiate: () => sendMessageToChannelMock,
        injectionToken: sendMessageToChannelInjectionToken,
      }),
    );

    di.register(setLensIdLicenseTrialInjectable);
  });

  describe("given no license service", () => {
    let setLensIdLicenseTrial: SetLensIdLicenseTrial;

    beforeEach(() => {
      di.override(lensIdLicenseServiceInjectionToken, () => computed(() => undefined));
      setLensIdLicenseTrial = di.inject(setLensIdLicenseTrialInjectable);
    });

    describe("when setting trial", () => {
      beforeEach(() => {
        setLensIdLicenseTrial(true);
      });

      it("sends message to channel", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteTrialChannel, true);
      });

      it("does not call substituteLicenseTrial", () => {
        expect(substituteLicenseTrialMock).not.toHaveBeenCalled();
      });
    });
  });

  describe("given license service exists", () => {
    let setLensIdLicenseTrial: SetLensIdLicenseTrial;

    beforeEach(() => {
      di.override(lensIdLicenseServiceInjectionToken, () =>
        computed(
          () =>
            ({
              substituteLicenseTrial: substituteLicenseTrialMock,
            }) as unknown as LicenseService,
        ),
      );
      setLensIdLicenseTrial = di.inject(setLensIdLicenseTrialInjectable);
    });

    describe("when setting trial to true", () => {
      beforeEach(() => {
        setLensIdLicenseTrial(true);
      });

      it("calls substituteLicenseTrial with true", () => {
        expect(substituteLicenseTrialMock).toHaveBeenCalledWith(true);
      });

      it("sends message to substitute trial channel with true", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteTrialChannel, true);
      });
    });

    describe("when setting trial to false", () => {
      beforeEach(() => {
        setLensIdLicenseTrial(false);
      });

      it("calls substituteLicenseTrial with false", () => {
        expect(substituteLicenseTrialMock).toHaveBeenCalledWith(false);
      });

      it("sends message to substitute trial channel with false", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteTrialChannel, false);
      });
    });
  });
});
