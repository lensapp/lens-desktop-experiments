import { createContainer, getInjectable, type DiContainer } from "@lensapp/injectable";
import { computed } from "mobx";
import {
  setLensIdLicenseFeaturesInjectable,
  type SetLensIdLicenseFeatures,
} from "./set-lens-id-license-features.injectable";
import { lensIdLicenseServiceInjectionToken, substituteFeaturesChannel } from "@lensapp/lens-id";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";
import type { EnableableFeature } from "./features.injectable";
import type { LicenseService } from "@lensapp/lens-platform-extension-sdk";

describe("setLensIdLicenseFeaturesInjectable", () => {
  let di: DiContainer;
  let sendMessageToChannelMock: jest.Mock;
  let substituteLicenseFeaturesMock: jest.Mock;

  beforeEach(() => {
    di = createContainer("irrelevant");

    sendMessageToChannelMock = jest.fn();
    substituteLicenseFeaturesMock = jest.fn();

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

    di.register(setLensIdLicenseFeaturesInjectable);
  });

  describe("given no license service", () => {
    let setLensIdLicenseFeatures: SetLensIdLicenseFeatures;

    beforeEach(() => {
      di.override(lensIdLicenseServiceInjectionToken, () => computed(() => undefined));
      setLensIdLicenseFeatures = di.inject(setLensIdLicenseFeaturesInjectable);
    });

    describe("when setting features", () => {
      beforeEach(() => {
        setLensIdLicenseFeatures([{ name: "some-feature", isEnabled: true }]);
      });

      it("sends message to channel", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteFeaturesChannel, ["some-feature"]);
      });

      it("does not call substituteLicenseFeatures", () => {
        expect(substituteLicenseFeaturesMock).not.toHaveBeenCalled();
      });
    });
  });

  describe("given license service exists", () => {
    let setLensIdLicenseFeatures: SetLensIdLicenseFeatures;

    beforeEach(() => {
      di.override(lensIdLicenseServiceInjectionToken, () =>
        computed(
          () =>
            ({
              substituteLicenseFeatures: substituteLicenseFeaturesMock,
            }) as unknown as LicenseService,
        ),
      );
      setLensIdLicenseFeatures = di.inject(setLensIdLicenseFeaturesInjectable);
    });

    describe("when setting enabled features", () => {
      let features: EnableableFeature[];

      beforeEach(() => {
        features = [
          { name: "some-feature-1", isEnabled: true },
          { name: "some-feature-2", isEnabled: true },
          { name: "some-feature-3", isEnabled: false },
        ];

        setLensIdLicenseFeatures(features);
      });

      it("calls substituteLicenseFeatures with only enabled features", () => {
        expect(substituteLicenseFeaturesMock).toHaveBeenCalledWith(["some-feature-1", "some-feature-2"]);
      });

      it("sends message to substitute features channel with enabled features", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteFeaturesChannel, [
          "some-feature-1",
          "some-feature-2",
        ]);
      });
    });

    describe("when setting all features as disabled", () => {
      beforeEach(() => {
        setLensIdLicenseFeatures([
          { name: "some-feature-1", isEnabled: false },
          { name: "some-feature-2", isEnabled: false },
        ]);
      });

      it("calls substituteLicenseFeatures with empty features array", () => {
        expect(substituteLicenseFeaturesMock).toHaveBeenCalledWith([]);
      });

      it("sends message with empty features array", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteFeaturesChannel, []);
      });
    });

    describe("when setting empty features array", () => {
      beforeEach(() => {
        setLensIdLicenseFeatures([]);
      });

      it("calls substituteLicenseFeatures with empty features array", () => {
        expect(substituteLicenseFeaturesMock).toHaveBeenCalledWith([]);
      });

      it("sends message with empty features array", () => {
        expect(sendMessageToChannelMock).toHaveBeenCalledWith(substituteFeaturesChannel, []);
      });
    });
  });
});
