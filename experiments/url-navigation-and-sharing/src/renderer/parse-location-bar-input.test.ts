import { parseLocationBarInput, resolveClusterScopedSegments } from "./parse-location-bar-input";

describe("parseLocationBarInput", () => {
  it("given a full four-segment path, parses cluster, resource plural, namespace, and resource name", () => {
    expect(parseLocationBarInput("lc-staging1/pods/bored-system/nginx-abc")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "pods",
      namespaces: ["bored-system"],
      resourceName: "nginx-abc",
    });
  });

  it("given a three-segment path without a resource name, parses cluster, plural, and namespace", () => {
    expect(parseLocationBarInput("lc-staging1/deployments/default")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "deployments",
      namespaces: ["default"],
      resourceName: undefined,
    });
  });

  it("given a comma-separated namespace segment, parses multiple namespaces", () => {
    expect(parseLocationBarInput("lc-staging1/pods/default,kube-system")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "pods",
      namespaces: ["default", "kube-system"],
      resourceName: undefined,
    });
  });

  it("trims whitespace between comma-separated namespaces", () => {
    expect(parseLocationBarInput("lc-staging1/pods/default , kube-system")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "pods",
      namespaces: ["default", "kube-system"],
      resourceName: undefined,
    });
  });

  it("given a two-segment path, parses cluster and resource plural only", () => {
    expect(parseLocationBarInput("lc-staging1/pods")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "pods",
      namespaces: undefined,
      resourceName: undefined,
    });
  });

  it("given a single-segment path, parses the cluster name only", () => {
    expect(parseLocationBarInput("lc-staging1")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: undefined,
      namespaces: undefined,
      resourceName: undefined,
    });
  });

  it("given whitespace around segments, trims each segment", () => {
    expect(parseLocationBarInput("  lc-staging1 / pods / default ")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "pods",
      namespaces: ["default"],
      resourceName: undefined,
    });
  });

  it("given leading and trailing slashes, ignores them", () => {
    expect(parseLocationBarInput("/lc-staging1/pods/default/")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "pods",
      namespaces: ["default"],
      resourceName: undefined,
    });
  });

  it("given empty segments between slashes, collapses them", () => {
    expect(parseLocationBarInput("lc-staging1//default")).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "default",
      namespaces: undefined,
      resourceName: undefined,
    });
  });

  describe("given nothing parseable", () => {
    it("returns undefined for empty string", () => {
      expect(parseLocationBarInput("")).toBeUndefined();
    });

    it("returns undefined for whitespace", () => {
      expect(parseLocationBarInput("   ")).toBeUndefined();
    });

    it("returns undefined for only slashes", () => {
      expect(parseLocationBarInput("///")).toBeUndefined();
    });
  });

  describe("given a known cluster name that contains slashes", () => {
    const arnClusterName = "arn:aws:eks:eu-west-1:841310725496:cluster/eksdemo1";

    it("keeps the ARN-style cluster name intact when it is the entire input", () => {
      expect(parseLocationBarInput(arnClusterName, [arnClusterName])).toEqual({
        clusterName: arnClusterName,
        resourcePluralName: undefined,
        namespaces: undefined,
        resourceName: undefined,
      });
    });

    it("splits plural/namespace/name off after the ARN cluster name", () => {
      expect(parseLocationBarInput(`${arnClusterName}/pods/default/nginx`, [arnClusterName])).toEqual({
        clusterName: arnClusterName,
        resourcePluralName: "pods",
        namespaces: ["default"],
        resourceName: "nginx",
      });
    });

    it("splits comma-separated namespaces after the ARN cluster name", () => {
      expect(parseLocationBarInput(`${arnClusterName}/pods/default,kube-system`, [arnClusterName])).toEqual({
        clusterName: arnClusterName,
        resourcePluralName: "pods",
        namespaces: ["default", "kube-system"],
        resourceName: undefined,
      });
    });

    it("prefers the longest matching cluster name", () => {
      const shortName = "arn:aws:eks:eu-west-1:841310725496:cluster";

      expect(parseLocationBarInput(`${arnClusterName}/pods`, [shortName, arnClusterName])).toEqual({
        clusterName: arnClusterName,
        resourcePluralName: "pods",
        namespaces: undefined,
        resourceName: undefined,
      });
    });

    it("falls back to naive splitting when the input does not match any known cluster", () => {
      expect(parseLocationBarInput(`${arnClusterName}/pods`, ["some-other-cluster"])).toEqual({
        clusterName: "arn:aws:eks:eu-west-1:841310725496:cluster",
        resourcePluralName: "eksdemo1",
        namespaces: ["pods"],
        resourceName: undefined,
      });
    });
  });
});

describe("resolveClusterScopedSegments", () => {
  const isNamespaced = (plural: string) => {
    if (plural === "nodes" || plural === "persistentvolumes") {
      return false;
    }

    if (plural === "pods" || plural === "deployments") {
      return true;
    }

    return undefined;
  };

  it("shifts a cluster-scoped three-segment path so the namespace slot becomes the resource name", () => {
    expect(
      resolveClusterScopedSegments(
        {
          clusterName: "lc-staging1",
          resourcePluralName: "nodes",
          namespaces: ["ip-10-0-0-1"],
          resourceName: undefined,
        },
        isNamespaced,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "nodes",
      namespaces: undefined,
      resourceName: "ip-10-0-0-1",
    });
  });

  it("leaves a namespaced three-segment path alone", () => {
    expect(
      resolveClusterScopedSegments(
        {
          clusterName: "lc-staging1",
          resourcePluralName: "pods",
          namespaces: ["default"],
          resourceName: undefined,
        },
        isNamespaced,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "pods",
      namespaces: ["default"],
      resourceName: undefined,
    });
  });

  it("leaves three-segment paths with unknown scope alone", () => {
    expect(
      resolveClusterScopedSegments(
        {
          clusterName: "lc-staging1",
          resourcePluralName: "unknown-kind",
          namespaces: ["foo"],
          resourceName: undefined,
        },
        isNamespaced,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "unknown-kind",
      namespaces: ["foo"],
      resourceName: undefined,
    });
  });

  it("clears the namespace slot when a cluster-scoped four-segment path is somehow provided", () => {
    expect(
      resolveClusterScopedSegments(
        {
          clusterName: "lc-staging1",
          resourcePluralName: "nodes",
          namespaces: ["unexpected"],
          resourceName: "ip-10-0-0-1",
        },
        isNamespaced,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "nodes",
      namespaces: undefined,
      resourceName: "ip-10-0-0-1",
    });
  });

  it("leaves comma-separated namespace lists alone even for cluster-scoped kinds (ambiguous intent)", () => {
    expect(
      resolveClusterScopedSegments(
        {
          clusterName: "lc-staging1",
          resourcePluralName: "nodes",
          namespaces: ["foo", "bar"],
          resourceName: undefined,
        },
        isNamespaced,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: "nodes",
      namespaces: ["foo", "bar"],
      resourceName: undefined,
    });
  });

  it("is a no-op when no resource plural has been typed yet", () => {
    expect(
      resolveClusterScopedSegments(
        {
          clusterName: "lc-staging1",
          resourcePluralName: undefined,
          namespaces: undefined,
          resourceName: undefined,
        },
        isNamespaced,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      resourcePluralName: undefined,
      namespaces: undefined,
      resourceName: undefined,
    });
  });
});
