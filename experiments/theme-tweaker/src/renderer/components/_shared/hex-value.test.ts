import { hexValueOrFallback } from "./hex-value";

describe("hexValueOrFallback", () => {
  describe("given a valid 6-digit hex", () => {
    it("returns it unchanged", () => {
      expect(hexValueOrFallback("#3d90ce")).toBe("#3d90ce");
    });
  });

  describe("given a valid 8-digit RGBA hex", () => {
    it("truncates the alpha and returns 6 digits", () => {
      expect(hexValueOrFallback("#3d90ce80")).toBe("#3d90ce");
    });
  });

  describe("given an invalid value", () => {
    it("returns '#000000' for malformed hex", () => {
      expect(hexValueOrFallback("#gggggg")).toBe("#000000");
    });

    it("returns '#000000' for a named color", () => {
      expect(hexValueOrFallback("red")).toBe("#000000");
    });

    it("returns '#000000' for an empty string", () => {
      expect(hexValueOrFallback("")).toBe("#000000");
    });

    it("returns '#000000' for undefined", () => {
      expect(hexValueOrFallback(undefined)).toBe("#000000");
    });
  });
});
