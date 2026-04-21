import { connectionTypeForSlug, normalizeSourceSlug, teamworkSourceSlug } from "./source-slug";

describe("normalizeSourceSlug", () => {
  it("strips the -cluster-source suffix", () => {
    expect(normalizeSourceSlug("local-kubeconfig-cluster-source")).toBe("local-kubeconfig");
  });

  it("leaves ids without the conventional suffix unchanged", () => {
    expect(normalizeSourceSlug("some-random-id")).toBe("some-random-id");
  });

  it("is the identity for an already-stripped slug", () => {
    expect(normalizeSourceSlug("local-kubeconfig")).toBe("local-kubeconfig");
  });
});

describe("connectionTypeForSlug", () => {
  it("returns teamwork for the teamwork slug", () => {
    expect(connectionTypeForSlug(teamworkSourceSlug)).toBe("teamwork");
  });

  it("returns direct for every other slug", () => {
    expect(connectionTypeForSlug("local-kubeconfig")).toBe("direct");
    expect(connectionTypeForSlug("eks")).toBe("direct");
    expect(connectionTypeForSlug("some-unknown-source")).toBe("direct");
  });
});
