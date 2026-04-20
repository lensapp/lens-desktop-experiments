import { labelForTabType } from "./label-for-tab-type";

describe("labelForTabType", () => {
  it.each([
    ["welcome", "Welcome"],
    ["preferences", "Preferences"],
    ["release-notes", "Release notes"],
    ["space-settings", "Space settings"],
    ["premium-features", "Premium features"],
    ["kubernetes-resource-kind", "Kubernetes"],
  ])("maps the built-in tab type %j to %j", (input, expected) => {
    expect(labelForTabType(input)).toBe(expected);
  });

  it("falls back to the raw tab-type id so unknown tab types are still identifiable", () => {
    expect(labelForTabType("some-third-party-tab")).toBe("some-third-party-tab");
  });
});
