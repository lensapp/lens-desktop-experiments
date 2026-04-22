import { formatShareLink, isShareLink, parseShareLink } from "./parse-share-link";

describe("isShareLink", () => {
  it("recognises a slug-prefixed link", () => {
    expect(isShareLink("local-kubeconfig:abc/ns/pods")).toBe(true);
  });

  it("recognises a teamwork link", () => {
    expect(isShareLink("lens-spaces:cluster-uuid/default/deployments")).toBe(true);
  });

  it("tolerates leading whitespace from sloppy paste", () => {
    expect(isShareLink("   local-kubeconfig:abc/ns/pods")).toBe(true);
  });

  it("rejects a typed breadcrumb path", () => {
    expect(isShareLink("lc-staging1/default/pods")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isShareLink("")).toBe(false);
  });

  it("rejects an EKS ARN (multiple colons before the first slash)", () => {
    expect(isShareLink("arn:aws:eks:eu-west-1:841310725496:cluster/eksdemo1")).toBe(false);
  });

  it("rejects a bare slug with no specifier", () => {
    expect(isShareLink("local-kubeconfig:")).toBe(false);
  });
});

describe("parseShareLink", () => {
  it("extracts all four segments for a fully-qualified link", () => {
    expect(parseShareLink("local-kubeconfig:a7ffc6f8bf1ed76651c14756a061d662/default/pods/nginx-abc")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "a7ffc6f8bf1ed76651c14756a061d662",
      namespace: "default",
      resourcePluralName: "pods",
      resourceName: "nginx-abc",
    });
  });

  it("extracts a three-segment link without a resource name", () => {
    expect(parseShareLink("lens-spaces:cluster-uuid/kube-system/deployments")).toEqual({
      sourceSlug: "lens-spaces",
      clusterSpecifier: "cluster-uuid",
      namespace: "kube-system",
      resourcePluralName: "deployments",
      resourceName: undefined,
    });
  });

  it("extracts a cluster-scoped link (two segments)", () => {
    expect(parseShareLink("local-kubeconfig:abc/nodes")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      namespace: "nodes",
      resourcePluralName: undefined,
      resourceName: undefined,
    });
  });

  it("returns a specifier-only link (no path tail)", () => {
    expect(parseShareLink("local-kubeconfig:abc")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      namespace: undefined,
      resourcePluralName: undefined,
      resourceName: undefined,
    });
  });

  it("tolerates whitespace around the link", () => {
    expect(parseShareLink("  eks:hash/default/pods  ")).toEqual({
      sourceSlug: "eks",
      clusterSpecifier: "hash",
      namespace: "default",
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("tolerates a trailing slash", () => {
    expect(parseShareLink("eks:hash/default/pods/")).toEqual({
      sourceSlug: "eks",
      clusterSpecifier: "hash",
      namespace: "default",
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("rejects an empty specifier", () => {
    expect(parseShareLink("local-kubeconfig:")).toBeUndefined();
  });

  it("rejects an empty specifier with a path tail", () => {
    expect(parseShareLink("local-kubeconfig:/ns/pods")).toBeUndefined();
  });

  it("returns undefined for a non-prefixed input", () => {
    expect(parseShareLink("just/some/path")).toBeUndefined();
  });

  it("returns undefined for a lens:// URL", () => {
    expect(parseShareLink("lens://app/open/direct/abc/cluster/pods")).toBeUndefined();
  });
});

describe("formatShareLink", () => {
  it("renders a full four-segment link", () => {
    expect(
      formatShareLink({
        sourceSlug: "local-kubeconfig",
        clusterSpecifier: "a7ffc6f8bf1ed76651c14756a061d662",
        namespace: "default",
        resourcePluralName: "pods",
        resourceName: "nginx-abc",
      }),
    ).toBe("local-kubeconfig:a7ffc6f8bf1ed76651c14756a061d662/default/pods/nginx-abc");
  });

  it("omits missing trailing segments", () => {
    expect(
      formatShareLink({
        sourceSlug: "lens-spaces",
        clusterSpecifier: "cluster-uuid",
        namespace: "kube-system",
        resourcePluralName: "deployments",
        resourceName: undefined,
      }),
    ).toBe("lens-spaces:cluster-uuid/kube-system/deployments");
  });

  it("renders a specifier-only link when nothing else is known", () => {
    expect(
      formatShareLink({
        sourceSlug: "eks",
        clusterSpecifier: "hash",
        namespace: undefined,
        resourcePluralName: undefined,
        resourceName: undefined,
      }),
    ).toBe("eks:hash");
  });

  it("round-trips through parseShareLink", () => {
    const parsed = {
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      namespace: "default",
      resourcePluralName: "pods",
      resourceName: "nginx",
    };

    expect(parseShareLink(formatShareLink(parsed))).toEqual(parsed);
  });
});
