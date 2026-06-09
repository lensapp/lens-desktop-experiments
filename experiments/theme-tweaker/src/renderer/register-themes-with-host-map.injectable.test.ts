import { createContainer, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { getStrictOverrideOf } from "@lensapp/test-utils";
import { getPersistedInjectionToken, type Persisted } from "@lensapp/persisted-state";
import { lensThemesInjectionToken, type LensTheme } from "@lensapp/theme";
import { colorThemeInjectable, type ColorTheme } from "@lensapp/user-preferences";
import { autorun, type IObservableValue } from "mobx";
import sendThemeTweakerTelemetryInjectable from "./telemetry/send-theme-tweaker-telemetry.injectable";
import { themeTweakerRendererFeature } from "./feature";
import registerThemesWithHostMapInjectable from "./register-themes-with-host-map.injectable";
import { customThemeId } from "./themes/custom-theme-id";

describe("theme-tweaker register-themes-with-host-map workaround", () => {
  let di: DiContainer;
  let lensThemes: Map<string, LensTheme>;
  let colorTheme: IObservableValue<ColorTheme>;
  let run: () => void;

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
    run = di.inject(registerThemesWithHostMapInjectable).run;

    // Simulate the production startup ordering: host builds its theme Map before the
    // experiment's theme declarations make it in.
    lensThemes.delete(customThemeId);
  });

  describe("when persisted colorTheme points at a theme the host's map is missing", () => {
    let colorThemeNotifications: number;

    beforeEach(() => {
      colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId });

      colorThemeNotifications = 0;
      const stop = autorun(() => {
        colorTheme.get();
        colorThemeNotifications += 1;
      });

      // Discount the initial autorun tick so we only count post-run notifications.
      const baseline = colorThemeNotifications;

      run();
      stop();

      colorThemeNotifications -= baseline;
    });

    it("patches the missing theme into the host's map", () => {
      expect(lensThemes.has(customThemeId)).toBe(true);
    });

    it("nudges colorTheme so the host's activeTheme reaction re-fires", () => {
      expect(colorThemeNotifications).toBeGreaterThan(0);
    });
  });

  describe("when persisted colorTheme points at a theme the host already knows", () => {
    let colorThemeNotifications: number;

    beforeEach(() => {
      colorTheme.set({ matchSystemTheme: false, lensThemeId: "some-builtin-theme" });

      colorThemeNotifications = 0;
      const stop = autorun(() => {
        colorTheme.get();
        colorThemeNotifications += 1;
      });

      const baseline = colorThemeNotifications;

      run();
      stop();

      colorThemeNotifications -= baseline;
    });

    it("still patches the missing custom theme into the host's map", () => {
      expect(lensThemes.has(customThemeId)).toBe(true);
    });

    it("does not nudge colorTheme", () => {
      expect(colorThemeNotifications).toBe(0);
    });
  });

  describe("when persisted colorTheme is matchSystemTheme", () => {
    let colorThemeNotifications: number;

    beforeEach(() => {
      colorTheme.set({ matchSystemTheme: true });

      colorThemeNotifications = 0;
      const stop = autorun(() => {
        colorTheme.get();
        colorThemeNotifications += 1;
      });

      const baseline = colorThemeNotifications;

      run();
      stop();

      colorThemeNotifications -= baseline;
    });

    it("does not nudge colorTheme — host resolves by type, not by id", () => {
      expect(colorThemeNotifications).toBe(0);
    });
  });
});
