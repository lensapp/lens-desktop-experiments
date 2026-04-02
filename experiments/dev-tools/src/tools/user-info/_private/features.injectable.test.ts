import { createContainer, type DiContainer } from "@lensapp/injectable";
import { computed, observable, runInAction } from "mobx";
import { featuresInjectable, type EnableableFeature } from "./features.injectable";
import { lensIdLicenseInjectionToken } from "@lensapp/lens-id";
import type { License } from "@lensapp/lens-platform-extension-sdk";
import { registerFeature } from "@lensapp/feature-core";
import type { IComputedValue } from "mobx";
import { userInfoDevToolFeature } from "../feature";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";

const getLicenseWithFeatures = (features: string[]): License => ({
  type: "pro",
  issuedAt: 42,
  expiresAt: 84,
  issuedTo: {
    givenName: "irrelevant",
    familyName: "irrelevant",
    email: "irrelevant@example.com",
  },
  features,
  disabledFeatures: [],
  trial: false,
  issuedBy: { name: "irrelevant" },
  metadata: null,
});

describe("featuresInjectable", () => {
  let di: DiContainer;
  let licenseBox: ReturnType<typeof observable.box<License | null>>;

  beforeEach(() => {
    di = createContainer("irrelevant");

    licenseBox = observable.box<License | null>(null);

    registerFeature(di, userInfoDevToolFeature);

    runAllTestUtilityRunnables(di);

    di.override(lensIdLicenseInjectionToken, () => computed(() => licenseBox.get()));
  });

  describe("given no license", () => {
    let features: IComputedValue<EnableableFeature[]>;

    beforeEach(() => {
      features = di.inject(featuresInjectable);
    });

    it("returns empty array", () => {
      expect(features.get()).toEqual([]);
    });
  });

  describe("given license with features", () => {
    let features: IComputedValue<EnableableFeature[]>;

    beforeEach(() => {
      runInAction(() => {
        licenseBox.set(getLicenseWithFeatures(["some-feature-1", "some-feature-2"]));
      });

      features = di.inject(featuresInjectable);
    });

    it("returns features sorted alphabetically with enabled status", () => {
      expect(features.get()).toEqual([
        { name: "some-feature-1", isEnabled: true },
        { name: "some-feature-2", isEnabled: true },
      ]);
    });

    describe("when a feature is removed from license", () => {
      beforeEach(() => {
        runInAction(() => {
          licenseBox.set(getLicenseWithFeatures(["some-feature-1"]));
        });
      });

      it("keeps the removed feature in list but marks it as disabled", () => {
        expect(features.get()).toEqual([
          { name: "some-feature-1", isEnabled: true },
          { name: "some-feature-2", isEnabled: false },
        ]);
      });
    });

    describe("when a new feature is added to license", () => {
      beforeEach(() => {
        runInAction(() => {
          licenseBox.set(getLicenseWithFeatures(["some-feature-1", "some-feature-2", "some-feature-3"]));
        });
      });

      it("includes the new feature and keeps list sorted", () => {
        expect(features.get()).toEqual([
          { name: "some-feature-1", isEnabled: true },
          { name: "some-feature-2", isEnabled: true },
          { name: "some-feature-3", isEnabled: true },
        ]);
      });
    });

    describe("when license becomes null", () => {
      beforeEach(() => {
        runInAction(() => {
          licenseBox.set(null);
        });
      });

      it("keeps previously seen features but marks them all as disabled", () => {
        expect(features.get()).toEqual([
          { name: "some-feature-1", isEnabled: false },
          { name: "some-feature-2", isEnabled: false },
        ]);
      });
    });
  });

  describe("given features are added over multiple license changes", () => {
    let features: IComputedValue<EnableableFeature[]>;

    beforeEach(() => {
      runInAction(() => {
        licenseBox.set(getLicenseWithFeatures(["feature-a"]));
      });

      features = di.inject(featuresInjectable);

      runInAction(() => {
        licenseBox.set(getLicenseWithFeatures(["feature-b"]));
      });

      runInAction(() => {
        licenseBox.set(getLicenseWithFeatures(["feature-c"]));
      });
    });

    it("accumulates all features ever seen", () => {
      expect(features.get()).toEqual([
        { name: "feature-a", isEnabled: false },
        { name: "feature-b", isEnabled: false },
        { name: "feature-c", isEnabled: true },
      ]);
    });
  });

  describe("given license with unsorted features", () => {
    let features: IComputedValue<EnableableFeature[]>;

    beforeEach(() => {
      runInAction(() => {
        licenseBox.set(getLicenseWithFeatures(["zebra", "apple", "mango"]));
      });

      features = di.inject(featuresInjectable);
    });

    it("returns features sorted alphabetically", () => {
      expect(features.get()).toEqual([
        { name: "apple", isEnabled: true },
        { name: "mango", isEnabled: true },
        { name: "zebra", isEnabled: true },
      ]);
    });
  });

  describe("given license with duplicate features", () => {
    let features: IComputedValue<EnableableFeature[]>;

    beforeEach(() => {
      runInAction(() => {
        licenseBox.set(getLicenseWithFeatures(["some-feature", "some-feature", "some-feature"]));
      });

      features = di.inject(featuresInjectable);
    });

    it("returns unique features only", () => {
      expect(features.get()).toEqual([{ name: "some-feature", isEnabled: true }]);
    });
  });
});
