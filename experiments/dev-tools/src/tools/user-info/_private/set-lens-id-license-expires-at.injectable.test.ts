import { createContainer, getInjectable, type DiContainer } from "@lensapp/injectable";
import { computed } from "mobx";
import {
  setLensIdLicenseExpiresAtInjectable,
  type SetLensIdLicenseExpiresAt,
} from "./set-lens-id-license-expires-at.injectable";
import { lensIdLicenseServiceInjectionToken, substituteExpiresAtChannel } from "@lensapp/lens-id";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";
import type { LicenseService } from "@lensapp/lens-platform-extension-sdk";

describe("setLensIdLicenseExpiresAtInjectable", () => {
  let di: DiContainer;
  let sendMessageToChannelMock: jest.Mock;
  let substituteLicenseExpiresAtMock: jest.Mock;

  beforeEach(() => {
    di = createContainer("irrelevant");

    sendMessageToChannelMock = jest.fn();
    substituteLicenseExpiresAtMock = jest.fn();

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

    di.register(setLensIdLicenseExpiresAtInjectable);
  });

  describe("given no license service", () => {
    let setLensIdLicenseExpiresAt: SetLensIdLicenseExpiresAt;

    beforeEach(() => {
      di.override(lensIdLicenseServiceInjectionToken, () => computed(() => undefined));
      setLensIdLicenseExpiresAt = di.inject(setLensIdLicenseExpiresAtInjectable);
    });

    describe("when setting expiresAt", () => {
      beforeEach(() => {
        setLensIdLicenseExpiresAt(1700000000000);
      });

      it("sends message to channel", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteExpiresAtChannel, 1700000000000);
      });

      it("does not call substituteLicenseExpiresAt", () => {
        expect(substituteLicenseExpiresAtMock).not.toHaveBeenCalled();
      });
    });
  });

  describe("given license service exists", () => {
    let setLensIdLicenseExpiresAt: SetLensIdLicenseExpiresAt;

    beforeEach(() => {
      di.override(lensIdLicenseServiceInjectionToken, () =>
        computed(
          () =>
            ({
              substituteLicenseExpiresAt: substituteLicenseExpiresAtMock,
            }) as unknown as LicenseService,
        ),
      );
      setLensIdLicenseExpiresAt = di.inject(setLensIdLicenseExpiresAtInjectable);
    });

    describe("when setting expiresAt", () => {
      beforeEach(() => {
        setLensIdLicenseExpiresAt(1700000000000);
      });

      it("calls substituteLicenseExpiresAt with the provided value", () => {
        expect(substituteLicenseExpiresAtMock).toHaveBeenCalledWith(1700000000000);
      });

      it("sends message to substitute expiresAt channel", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteExpiresAtChannel, 1700000000000);
      });
    });

    describe("when setting expiresAt to zero", () => {
      beforeEach(() => {
        setLensIdLicenseExpiresAt(0);
      });

      it("calls substituteLicenseExpiresAt with zero", () => {
        expect(substituteLicenseExpiresAtMock).toHaveBeenCalledWith(0);
      });

      it("sends message with zero", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteExpiresAtChannel, 0);
      });
    });
  });
});
