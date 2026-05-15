import { createContainer, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { renderFor } from "@lensapp/rendering-test-utils";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";
import { getStrictOverrideOf } from "@lensapp/test-utils";
import { getPersistedInjectionToken, type Persisted } from "@lensapp/persisted-state";
import { fireEvent, type RenderResult } from "@testing-library/react";
import { act } from "react";
import { themeTweakerRendererFeature } from "../feature";
import { ThemeTweakerPage } from "./theme-tweaker-page";
import { savedThemesInjectable, type SavedTheme } from "../state/saved-themes.injectable";
import type { IObservableArray } from "mobx";

describe("theme-tweaker-page", () => {
  let di: DiContainer;
  let rendered: RenderResult;
  let savedThemes: IObservableArray<SavedTheme>;

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

    runAllTestUtilityRunnables(di);

    savedThemes = await di.inject(savedThemesInjectable);

    const render = renderFor(di);

    rendered = await render(<ThemeTweakerPage />);
  });

  describe("Save as flow", () => {
    describe("when user types a name and clicks Save as", () => {
      beforeEach(() => {
        const nameInput = rendered.getByPlaceholderText("Theme name…") as HTMLInputElement;

        act(() => {
          fireEvent.change(nameInput, { target: { value: "My Theme" } });
        });

        const saveButton = rendered.getByText("Save as…");

        act(() => {
          fireEvent.click(saveButton.closest("button") ?? saveButton);
        });
      });

      it("adds the theme to the saved-themes list", () => {
        expect(savedThemes.length).toBe(1);
      });

      it("stores the theme under the typed name", () => {
        expect(savedThemes[0].name).toBe("My Theme");
      });

      it("clears the name input", () => {
        const nameInput = rendered.getByPlaceholderText("Theme name…") as HTMLInputElement;

        expect(nameInput.value).toBe("");
      });

      it("renders the new theme in the saved-themes section", () => {
        expect(rendered.queryByText("My Theme")).toBeTruthy();
      });

      it("removes the 'No saved themes yet' empty state", () => {
        expect(rendered.queryByText(/No saved themes yet/)).toBeNull();
      });

      it("shows a success message confirming the save", () => {
        expect(rendered.queryByText(/Saved as "My Theme"/)).toBeTruthy();
      });
    });

    describe("when user clicks Save as without typing a name", () => {
      beforeEach(() => {
        const saveButton = rendered.getByText("Save as…");

        act(() => {
          fireEvent.click(saveButton.closest("button") ?? saveButton);
        });
      });

      it("does not add anything to the saved-themes list", () => {
        expect(savedThemes.length).toBe(0);
      });

      it("does not show a success message", () => {
        expect(rendered.queryByText(/Saved as/)).toBeNull();
      });
    });
  });
});
