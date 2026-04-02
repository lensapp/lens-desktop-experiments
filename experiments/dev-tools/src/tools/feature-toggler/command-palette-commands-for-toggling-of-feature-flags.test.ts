import type { IObservableValue } from "mobx";
import { autorun, computed, observable, runInAction } from "mobx";
import { type Feature, featureFlagInjectionToken, getFeature, registerFeature } from "@lensapp/feature-core";
import { createContainer, type DiContainer, getInjectable, getInjectionToken } from "@lensapp/injectable";
import { featureTogglerFeature } from "./feature";
import { act } from "react";
import { computedInjectManyInjectionToken } from "@lensapp/injectable-extension-for-mobx";
import { commandsInjectionToken } from "@lensapp/command-palette-renderer";
import { commandPaletteCommandsForTogglingOfFeatureFlagsInjectable } from "./command-palette-commands-for-toggling-of-feature-flags.injectable";
import { getMessageBridgeFake } from "@lensapp/messaging-fake-bridge";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";
import { unregisterInternalTestDoubles } from "@lensapp/messaging";

describe("command-palette-commands-for-toggling-of-feature-flags", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    di.preventSideEffects();

    registerFeature(di, featureTogglerFeature);

    runAllTestUtilityRunnables(di);

    // Todo: make messageBridgeFake the global override
    unregisterInternalTestDoubles(di);
    const messageBridgeFake = getMessageBridgeFake();
    messageBridgeFake.involveRendererLikeDi(di);
  });

  it("is a selection of command palette commands", () => {
    expect(commandPaletteCommandsForTogglingOfFeatureFlagsInjectable.injectionToken).toBe(commandsInjectionToken);
  });

  describe("when observed", () => {
    // Todo: use CommandWithId[]
    let actuallyObservedFlaggables: any[];

    beforeEach(() => {
      autorun(() => {
        actuallyObservedFlaggables = di.inject(commandPaletteCommandsForTogglingOfFeatureFlagsInjectable).get();
      });
    });

    it("initially, observes as no flaggable features", () => {
      expect(actuallyObservedFlaggables).toEqual([]);
    });

    describe("given a feature, and a related injectable", () => {
      let someFeature: Feature;
      let actuallyObservedInstance: string | undefined;

      beforeEach(() => {
        const someToken = getInjectionToken<string>({
          id: "some-token",
        });

        const someInjectable = getInjectable({
          id: "some-injectable-in-a-feature",
          instantiate: () => "some-instance",
          injectionToken: someToken,
        });

        someFeature = getFeature({
          id: "some-feature",

          tags: ["public", "renderer", "business"],

          register: (di) => {
            di.register(someInjectable);
          },

          dependencies: [],
        });

        const instances = di.inject(computedInjectManyInjectionToken)(someToken);

        autorun(() => {
          actuallyObservedInstance = instances.get().at(0);
        });

        runInAction(() => {
          registerFeature(di, someFeature);
        });
      });

      it("still, observes as no flaggable features", () => {
        expect(actuallyObservedFlaggables).toEqual([]);
      });

      it("related instance is observed", () => {
        expect(actuallyObservedInstance).toBe("some-instance");
      });

      describe("given a feature flag, but it is set to not hide the feature, when it emerges", () => {
        let featureIsFlagged: IObservableValue<boolean>;

        beforeEach(async () => {
          featureIsFlagged = observable.box(true);

          const someFeatureFlagInjectable = getInjectable({
            id: "some-feature-flag-for-some-feature",
            instantiate: () => computed(() => featureIsFlagged.get()),
            injectionToken: featureFlagInjectionToken.for(someFeature.id),
          });

          await act(async () => {
            runInAction(() => {
              di.register(someFeatureFlagInjectable);
            });
          });
        });

        it("shows flagging of the feature in the command palette", () => {
          expect(actuallyObservedFlaggables.map((x) => x.title.get())).toEqual([
            "Toggle feature-flag: some-feature-flag-for-some-feature",
          ]);
        });

        it("an instance related to the feature is still observed", () => {
          expect(actuallyObservedInstance).toBe("some-instance");
        });

        describe("when the feature is toggled to disable the feature", () => {
          beforeEach(async () => {
            actuallyObservedFlaggables.find((x) => x.id === "some-feature-flag-for-some-feature").action();
          });

          it("the feature flag indicates as disabled", () => {
            expect(actuallyObservedFlaggables.map((x) => x.title.get())).toEqual([
              "Toggle feature-flag: some-feature-flag-for-some-feature",
            ]);
          });

          it("an instance related to the feature is no longer observed", () => {
            expect(actuallyObservedInstance).toBe(undefined);
          });

          describe("when the feature is toggled again to enable the feature", () => {
            beforeEach(async () => {
              actuallyObservedFlaggables.find((x) => x.id === "some-feature-flag-for-some-feature").action();
            });

            it("the feature flag indicates as enabled again", () => {
              expect(actuallyObservedFlaggables.map((x) => x.title.get())).toEqual([
                "Toggle feature-flag: some-feature-flag-for-some-feature",
              ]);
            });

            it("an instance related to the feature is observed again", () => {
              expect(actuallyObservedInstance).toBe("some-instance");
            });
          });
        });
      });
    });
  });
});
