import { labelForTabType } from "./label-for-tab-type";

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
