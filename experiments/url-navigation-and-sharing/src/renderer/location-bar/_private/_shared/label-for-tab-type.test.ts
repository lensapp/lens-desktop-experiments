import { labelForTabType, tabTypeForLabel } from "./label-for-tab-type";

describe("labelForTabType", () => {
  describe("given a known built-in tab type", () => {
    it('shows "Welcome" for the welcome tab', () => {
      expect(labelForTabType("welcome")).toBe("Welcome");
    });

    it('shows "Preferences" for the preferences tab', () => {
      expect(labelForTabType("preferences")).toBe("Preferences");
    });

    it('shows "Release notes" for the release-notes tab', () => {
      expect(labelForTabType("release-notes")).toBe("Release notes");
    });

    it('shows "Space settings" for the space-settings tab', () => {
      expect(labelForTabType("space-settings")).toBe("Space settings");
    });

    it('shows "Premium features" for the premium-features tab', () => {
      expect(labelForTabType("premium-features")).toBe("Premium features");
    });

    it('shows "Kubernetes" for the kubernetes-resource-kind tab', () => {
      expect(labelForTabType("kubernetes-resource-kind")).toBe("Kubernetes");
    });
  });

  describe("given an unknown tab type", () => {
    it("falls back to the raw tab-type id so it is still identifiable", () => {
      expect(labelForTabType("some-third-party-tab")).toBe("some-third-party-tab");
    });
  });
});

describe("tabTypeForLabel", () => {
  describe("given the display label of a known built-in tab", () => {
    it("resolves Preferences to its tab type", () => {
      expect(tabTypeForLabel("Preferences")).toBe("preferences");
    });

    it("resolves Welcome to its tab type", () => {
      expect(tabTypeForLabel("Welcome")).toBe("welcome");
    });

    it('resolves "Release notes" to its tab type', () => {
      expect(tabTypeForLabel("Release notes")).toBe("release-notes");
    });
  });

  describe("given a label that differs only in case or whitespace", () => {
    it("matches lowercased input", () => {
      expect(tabTypeForLabel("preferences")).toBe("preferences");
    });

    it("trims surrounding whitespace", () => {
      expect(tabTypeForLabel("  Preferences  ")).toBe("preferences");
    });
  });

  describe("given a label that doesn't correspond to any built-in tab", () => {
    it("returns undefined", () => {
      expect(tabTypeForLabel("Something else")).toBeUndefined();
    });
  });
});
