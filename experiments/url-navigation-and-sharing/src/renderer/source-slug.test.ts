import { connectionTypeForSource, denormalizeSourceSlug, normalizeSourceSlug } from "./source-slug";

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

describe("denormalizeSourceSlug", () => {
  it("appends -cluster-source to a stripped slug", () => {
    expect(denormalizeSourceSlug("local-kubeconfig")).toBe("local-kubeconfig-cluster-source");
  });

  it("does not double-append when the suffix is already present", () => {
    expect(denormalizeSourceSlug("local-kubeconfig-cluster-source")).toBe("local-kubeconfig-cluster-source");
  });
});

describe("connectionTypeForSource", () => {
  it("returns teamwork for lens-spaces-cluster-source", () => {
    expect(connectionTypeForSource("lens-spaces-cluster-source")).toBe("teamwork");
  });

  it("returns direct for everything else", () => {
    expect(connectionTypeForSource("local-kubeconfig-cluster-source")).toBe("direct");
    expect(connectionTypeForSource("eks-cluster-source")).toBe("direct");
    expect(connectionTypeForSource("some-unknown-source")).toBe("direct");
  });
});
