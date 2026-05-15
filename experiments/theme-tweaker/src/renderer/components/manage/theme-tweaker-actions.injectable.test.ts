import { createContainer, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { getStrictOverrideOf } from "@lensapp/test-utils";
import { getPersistedInjectionToken, type Persisted } from "@lensapp/persisted-state";
import { themeTweakerRendererFeature } from "../../feature";
import { themeTweakerActionsInjectable, type ThemeTweakerActions } from "./theme-tweaker-actions.injectable";
import { customDarkColorsInjectable, customLightColorsInjectable } from "../../state/custom-theme-colors.injectable";
import { customThemeModeInjectable } from "../../state/custom-theme-mode.injectable";
import { savedThemesInjectable, type SavedTheme } from "../../state/saved-themes.injectable";
import { customThemeId } from "../../themes/custom-theme-id";
import { colorThemeInjectable } from "@lensapp/user-preferences";
import type { IObservableArray, IObservableValue, ObservableMap } from "mobx";

describe("theme-tweaker actions", () => {
  let di: DiContainer;
  let actions: ThemeTweakerActions;
  let savedThemes: IObservableArray<SavedTheme>;
  let darkColors: ObservableMap<string, string>;
  let mode: IObservableValue<"dark" | "light">;

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

    actions = await di.inject(themeTweakerActionsInjectable);
    savedThemes = await di.inject(savedThemesInjectable);
    darkColors = await di.inject(customDarkColorsInjectable);
    mode = await di.inject(customThemeModeInjectable);
  });

  describe("setMode", () => {
    describe("when user toggles to light mode", () => {
      beforeEach(() => {
        actions.setMode("light");
      });

      it("updates the mode observable", () => {
        expect(mode.get()).toBe("light");
      });

      it("activates the Custom theme", () => {
        expect(di.inject(colorThemeInjectable).get()).toEqual({
          matchSystemTheme: false,
          lensThemeId: customThemeId,
        });
      });
    });
  });

  describe("applyPreset", () => {
    describe("when user applies a light preset while in dark mode", () => {
      beforeEach(async () => {
        actions.applyPreset({
          id: "test-light-preset",
          name: "Test light",
          type: "light",
          author: "Test",
          description: "",
          overrides: { mainBackground: "#ffffff", primary: "#3d90ce" },
          swatch: ["#ffffff", "#3d90ce", "#000000", "#555555"],
        });
      });

      it("switches mode to light", () => {
        expect(mode.get()).toBe("light");
      });

      it("writes the override values into the light color map", async () => {
        const lightColors = await di.inject(customLightColorsInjectable);

        expect(lightColors.get("mainBackground")).toBe("#ffffff");
        expect(lightColors.get("primary")).toBe("#3d90ce");
      });

      it("seeds non-overridden slots with the light theme defaults", async () => {
        const lightColors = await di.inject(customLightColorsInjectable);

        expect(lightColors.get("textColorPrimary")).toBe("#555555");
      });

      it("does not touch the dark color map", () => {
        expect(darkColors.get("mainBackground")).toBe("#181A1C");
      });

      it("activates the Custom theme", () => {
        expect(di.inject(colorThemeInjectable).get()).toEqual({
          matchSystemTheme: false,
          lensThemeId: customThemeId,
        });
      });
    });
  });

  describe("saveCurrentAs", () => {
    describe("given an empty saved-themes list", () => {
      describe("when user saves under name 'My Theme'", () => {
        let didSave: boolean;

        beforeEach(() => {
          didSave = actions.saveCurrentAs("My Theme", "dark");
        });

        it("returns true", () => {
          expect(didSave).toBe(true);
        });

        it("appends a single entry to savedThemes", () => {
          expect(savedThemes.length).toBe(1);
        });

        it("stores the entry under that name", () => {
          expect(savedThemes[0].name).toBe("My Theme");
        });

        it("stores the entry's mode", () => {
          expect(savedThemes[0].mode).toBe("dark");
        });
      });
    });

    describe("when user saves with an empty name", () => {
      let didSave: boolean;

      beforeEach(() => {
        didSave = actions.saveCurrentAs("   ", "dark");
      });

      it("returns false", () => {
        expect(didSave).toBe(false);
      });

      it("does not mutate savedThemes", () => {
        expect(savedThemes.length).toBe(0);
      });
    });

    describe("given an existing theme named 'My Theme'", () => {
      beforeEach(() => {
        actions.saveCurrentAs("My Theme", "dark");
      });

      describe("when user saves again with the same name", () => {
        beforeEach(() => {
          actions.saveCurrentAs("My Theme", "dark");
        });

        it("does not append a second entry", () => {
          expect(savedThemes.length).toBe(1);
        });
      });
    });

    describe("when user saves three themes in sequence", () => {
      beforeEach(() => {
        actions.saveCurrentAs("First", "dark");
        actions.saveCurrentAs("Second", "dark");
        actions.saveCurrentAs("Third", "dark");
      });

      it("orders them newest-first", () => {
        expect(savedThemes.map((t) => t.name)).toEqual(["Third", "Second", "First"]);
      });

      describe("when user re-saves the oldest one", () => {
        beforeEach(() => {
          actions.saveCurrentAs("First", "dark");
        });

        it("moves it to the top", () => {
          expect(savedThemes.map((t) => t.name)).toEqual(["First", "Third", "Second"]);
        });
      });
    });
  });

  describe("resetCurrentMode", () => {
    describe("given some dark colors have been overridden", () => {
      beforeEach(() => {
        darkColors.set("primary", "#ff0000");
      });

      describe("when user resets dark mode", () => {
        beforeEach(() => {
          actions.resetCurrentMode("dark");
        });

        it("restores the default primary color", () => {
          expect(darkColors.get("primary")).toBe("#3d90ce");
        });
      });
    });
  });
});
