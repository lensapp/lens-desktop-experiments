import { createContainer, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { getStrictOverrideOf } from "@lensapp/test-utils";
import { getPersistedInjectionToken, type Persisted } from "@lensapp/persisted-state";
import { lensThemesInjectionToken, type LensTheme } from "@lensapp/theme";
import { colorThemeInjectable, type ColorTheme } from "@lensapp/user-preferences";
import { runInAction, type IObservableValue } from "mobx";
import sendThemeTweakerTelemetryInjectable from "./telemetry/send-theme-tweaker-telemetry.injectable";
import { themeTweakerRendererFeature } from "./feature";
import registerThemesWithHostMapInjectable from "./register-themes-with-host-map.injectable";
import { wantsCustomThemeInjectable } from "./state/wants-custom-theme.injectable";
import { customThemeId } from "./themes/custom-theme-id";

describe("theme-tweaker register-themes-with-host-map workaround", () => {
  let di: DiContainer;
  let lensThemes: Map<string, LensTheme>;
  let colorTheme: IObservableValue<ColorTheme>;
  let wantsCustomTheme: IObservableValue<boolean>;

  const flushMicrotasks = () => new Promise<void>((resolve) => setImmediate(resolve));

  const runWorkaround = async () => {
    await di.inject(registerThemesWithHostMapInjectable).run();
  };

  beforeEach(async () => {
    di = createContainer("irrelevant");
    registerFeature(di, themeTweakerRendererFeature);

    const getPersistedMock = getStrictOverrideOf(di, getPersistedInjectionToken);

    getPersistedMock.mockImplementation(
      (_key, observableValue) =>
        ({
          promise: async () => observableValue,
        }) as unknown as Persisted<any>,
    );

    di.override(sendThemeTweakerTelemetryInjectable, () => () => {});
    di.permitSideEffects(registerThemesWithHostMapInjectable);

    lensThemes = di.inject(lensThemesInjectionToken);
    colorTheme = di.inject(colorThemeInjectable);
    wantsCustomTheme = await di.inject(wantsCustomThemeInjectable);

    // Simulate the production startup ordering: the host has already built its theme
    // Map and rejected the persisted "theme-tweaker-custom" via its validator, so
    // colorTheme has been reset to the default while wantsCustomTheme survived in our
    // own persisted state.
    lensThemes.delete(customThemeId);
    colorTheme.set({ matchSystemTheme: false, lensThemeId: "lens-dark" });
  });

  it("patches missing experiment themes into the host's map", async () => {
    await runWorkaround();

    expect(lensThemes.has(customThemeId)).toBe(true);
  });

  describe("when the user last applied a Theme Tweaker theme", () => {
    beforeEach(async () => {
      wantsCustomTheme.set(true);
      await runWorkaround();
    });

    it("restores colorTheme to the custom theme id", () => {
      expect(colorTheme.get()).toEqual({
        matchSystemTheme: false,
        lensThemeId: customThemeId,
      });
    });
  });

  describe("when the user is not on a Theme Tweaker theme", () => {
    beforeEach(async () => {
      wantsCustomTheme.set(false);
      await runWorkaround();
    });

    it("leaves colorTheme alone", () => {
      expect(colorTheme.get()).toEqual({
        matchSystemTheme: false,
        lensThemeId: "lens-dark",
      });
    });
  });

  describe("the wantsCustomTheme sync reaction", () => {
    beforeEach(async () => {
      wantsCustomTheme.set(false);
      await runWorkaround();
    });

    it("sets the flag to true when colorTheme switches to the custom theme", async () => {
      runInAction(() => colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId }));
      await flushMicrotasks();

      expect(wantsCustomTheme.get()).toBe(true);
    });

    it("clears the flag when colorTheme switches to a built-in theme", async () => {
      runInAction(() => colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId }));
      await flushMicrotasks();
      runInAction(() => colorTheme.set({ matchSystemTheme: false, lensThemeId: "lens-light" }));
      await flushMicrotasks();

      expect(wantsCustomTheme.get()).toBe(false);
    });

    it("clears the flag when the user enables matchSystemTheme", async () => {
      runInAction(() => colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId }));
      await flushMicrotasks();
      runInAction(() => colorTheme.set({ matchSystemTheme: true }));
      await flushMicrotasks();

      expect(wantsCustomTheme.get()).toBe(false);
    });
  });
});
