import { formatShareLink, isShareLink, parseShareLink } from "./parse-share-link";

describe("isShareLink", () => {
  it("recognises a slug-prefixed link", () => {
    expect(isShareLink("local-kubeconfig:abc/pods/ns")).toBe(true);
  });

  it("recognises a teamwork link", () => {
    expect(isShareLink("lens-spaces:cluster-uuid/deployments/default")).toBe(true);
  });

  it("tolerates leading whitespace from sloppy paste", () => {
    expect(isShareLink("   local-kubeconfig:abc/pods/ns")).toBe(true);
  });

  it("rejects a typed breadcrumb path", () => {
    expect(isShareLink("lc-staging1/pods/default")).toBe(false);
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
    expect(parseShareLink("local-kubeconfig:a7ffc6f8bf1ed76651c14756a061d662/pods/default/nginx-abc")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "a7ffc6f8bf1ed76651c14756a061d662",
      resourcePluralName: "pods",
      namespaces: ["default"],
      resourceName: "nginx-abc",
    });
  });

  it("extracts a three-segment link without a resource name", () => {
    expect(parseShareLink("lens-spaces:cluster-uuid/deployments/kube-system")).toEqual({
      sourceSlug: "lens-spaces",
      clusterSpecifier: "cluster-uuid",
      resourcePluralName: "deployments",
      namespaces: ["kube-system"],
      resourceName: undefined,
    });
  });

  it("extracts multiple comma-separated namespaces", () => {
    expect(parseShareLink("local-kubeconfig:abc/pods/default,kube-system")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      resourcePluralName: "pods",
      namespaces: ["default", "kube-system"],
      resourceName: undefined,
    });
  });

  it("trims whitespace between comma-separated namespaces", () => {
    expect(parseShareLink("local-kubeconfig:abc/pods/default , kube-system")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      resourcePluralName: "pods",
      namespaces: ["default", "kube-system"],
      resourceName: undefined,
    });
  });

  it("extracts a cluster-scoped link without namespace", () => {
    expect(parseShareLink("local-kubeconfig:abc/nodes")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      resourcePluralName: "nodes",
      namespaces: undefined,
      resourceName: undefined,
    });
  });

  it("extracts a cluster-scoped link with resource name (three segments)", () => {
    expect(parseShareLink("local-kubeconfig:abc/nodes/ip-10-0-0-1")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      resourcePluralName: "nodes",
      namespaces: ["ip-10-0-0-1"],
      resourceName: undefined,
    });
  });

  it("returns a specifier-only link (no path tail)", () => {
    expect(parseShareLink("local-kubeconfig:abc")).toEqual({
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      resourcePluralName: undefined,
      namespaces: undefined,
      resourceName: undefined,
    });
  });

  it("tolerates whitespace around the link", () => {
    expect(parseShareLink("  eks:hash/pods/default  ")).toEqual({
      sourceSlug: "eks",
      clusterSpecifier: "hash",
      resourcePluralName: "pods",
      namespaces: ["default"],
      resourceName: undefined,
    });
  });

  it("tolerates a trailing slash", () => {
    expect(parseShareLink("eks:hash/pods/default/")).toEqual({
      sourceSlug: "eks",
      clusterSpecifier: "hash",
      resourcePluralName: "pods",
      namespaces: ["default"],
      resourceName: undefined,
    });
  });

  it("rejects an empty specifier", () => {
    expect(parseShareLink("local-kubeconfig:")).toBeUndefined();
  });

  it("rejects an empty specifier with a path tail", () => {
    expect(parseShareLink("local-kubeconfig:/pods/ns")).toBeUndefined();
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
        resourcePluralName: "pods",
        namespaces: ["default"],
        resourceName: "nginx-abc",
      }),
    ).toBe("local-kubeconfig:a7ffc6f8bf1ed76651c14756a061d662/pods/default/nginx-abc");
  });

  it("joins multiple namespaces with commas", () => {
    expect(
      formatShareLink({
        sourceSlug: "local-kubeconfig",
        clusterSpecifier: "abc",
        resourcePluralName: "pods",
        namespaces: ["default", "kube-system"],
        resourceName: undefined,
      }),
    ).toBe("local-kubeconfig:abc/pods/default,kube-system");
  });

  it("omits missing trailing segments", () => {
    expect(
      formatShareLink({
        sourceSlug: "lens-spaces",
        clusterSpecifier: "cluster-uuid",
        resourcePluralName: "deployments",
        namespaces: ["kube-system"],
        resourceName: undefined,
      }),
    ).toBe("lens-spaces:cluster-uuid/deployments/kube-system");
  });

  it("renders a cluster-scoped link without a namespace slot", () => {
    expect(
      formatShareLink({
        sourceSlug: "local-kubeconfig",
        clusterSpecifier: "abc",
        resourcePluralName: "nodes",
        namespaces: undefined,
        resourceName: "ip-10-0-0-1",
      }),
    ).toBe("local-kubeconfig:abc/nodes/ip-10-0-0-1");
  });

  it("renders a specifier-only link when nothing else is known", () => {
    expect(
      formatShareLink({
        sourceSlug: "eks",
        clusterSpecifier: "hash",
        resourcePluralName: undefined,
        namespaces: undefined,
        resourceName: undefined,
      }),
    ).toBe("eks:hash");
  });

  it("round-trips through parseShareLink", () => {
    const parsed = {
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      resourcePluralName: "pods",
      namespaces: ["default"],
      resourceName: "nginx",
    };

    expect(parseShareLink(formatShareLink(parsed))).toEqual(parsed);
  });

  it("round-trips multiple namespaces through parseShareLink", () => {
    const parsed = {
      sourceSlug: "local-kubeconfig",
      clusterSpecifier: "abc",
      resourcePluralName: "pods",
      namespaces: ["default", "kube-system"],
      resourceName: undefined,
    };

    expect(parseShareLink(formatShareLink(parsed))).toEqual(parsed);
  });
});
