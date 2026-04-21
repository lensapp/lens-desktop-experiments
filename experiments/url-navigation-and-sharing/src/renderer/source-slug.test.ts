import { connectionTypeForSlug, slugifyNavigatorName, teamworkSourceSlug } from "./source-slug";

describe("slugifyNavigatorName", () => {
  it("lowercases single-word names", () => {
    expect(slugifyNavigatorName("EKS")).toBe("eks");
  });

  it("hyphenates whitespace in multi-word names", () => {
    expect(slugifyNavigatorName("Local Kubeconfigs")).toBe("local-kubeconfigs");
    expect(slugifyNavigatorName("Lens Spaces")).toBe("lens-spaces");
  });

  it("collapses runs of whitespace to a single hyphen", () => {
    expect(slugifyNavigatorName("Some   Source")).toBe("some-source");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugifyNavigatorName("  EKS  ")).toBe("eks");
  });
});

describe("connectionTypeForSlug", () => {
  it("returns teamwork for the teamwork slug", () => {
    expect(connectionTypeForSlug(teamworkSourceSlug)).toBe("teamwork");
  });

  it("returns direct for every other slug", () => {
    expect(connectionTypeForSlug("local-kubeconfigs")).toBe("direct");
    expect(connectionTypeForSlug("eks")).toBe("direct");
    expect(connectionTypeForSlug("some-unknown-source")).toBe("direct");
  });
});
