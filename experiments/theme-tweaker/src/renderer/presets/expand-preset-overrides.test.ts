import { expandPresetOverrides } from "./expand-preset-overrides";

describe("expand-preset-overrides", () => {
  describe("given no overrides", () => {
    it("returns an empty object", () => {
      expect(expandPresetOverrides({})).toEqual({});
    });
  });

  describe("given a mainBackground override", () => {
    let result: Readonly<Record<string, string>>;

    beforeEach(() => {
      result = expandPresetOverrides({ mainBackground: "#1a1b26" });
    });

    it("propagates to the matching grey100 token", () => {
      expect(result.grey100).toBe("#1a1b26");
    });

    it("propagates to the backgroundSecondary synonym", () => {
      expect(result.backgroundSecondary).toBe("#1a1b26");
    });

    it("propagates to the layoutBackground synonym", () => {
      expect(result.layoutBackground).toBe("#1a1b26");
    });

    it("does not propagate to backgroundPrimary (different semantic slot)", () => {
      expect(result.backgroundPrimary).toBeUndefined();
    });
  });

  describe("when both semantic slot and the synonym are explicitly overridden", () => {
    let result: Readonly<Record<string, string>>;

    beforeEach(() => {
      result = expandPresetOverrides({
        mainBackground: "#1a1b26",
        backgroundSecondary: "#000000",
      });
    });

    it("preserves the explicit synonym override", () => {
      expect(result.backgroundSecondary).toBe("#000000");
    });

    it("still fans out the unset synonym", () => {
      expect(result.layoutBackground).toBe("#1a1b26");
    });
  });

  describe("when both semantic slot and the grey token are explicitly overridden", () => {
    let result: Readonly<Record<string, string>>;

    beforeEach(() => {
      result = expandPresetOverrides({
        mainBackground: "#1a1b26",
        grey100: "#000000",
      });
    });

    it("preserves the explicit grey override", () => {
      expect(result.grey100).toBe("#000000");
    });
  });

  describe("when given a borderColor override", () => {
    let result: Readonly<Record<string, string>>;

    beforeEach(() => {
      result = expandPresetOverrides({ borderColor: "#414868" });
    });

    it("propagates to grey60", () => {
      expect(result.grey60).toBe("#414868");
    });

    it("propagates to layoutBorderColor", () => {
      expect(result.layoutBorderColor).toBe("#414868");
    });

    it("propagates to modalDividerColor", () => {
      expect(result.modalDividerColor).toBe("#414868");
    });
  });

  describe("when given a textColorPrimary override", () => {
    let result: Readonly<Record<string, string>>;

    beforeEach(() => {
      result = expandPresetOverrides({ textColorPrimary: "#a9b1d6" });
    });

    it("propagates to grey20", () => {
      expect(result.grey20).toBe("#a9b1d6");
    });

    it("propagates to all four text synonyms", () => {
      expect(result.textColorTertiary).toBe("#a9b1d6");
      expect(result.settingsColor).toBe("#a9b1d6");
      expect(result.modalTextColor).toBe("#a9b1d6");
      expect(result.modalSubtleHeaderColor).toBe("#a9b1d6");
    });
  });
});
