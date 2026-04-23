import { parseLocationBarInput, resolveLocationSegments } from "./parse-location-bar-input";

describe("parseLocationBarInput", () => {
  it("given a full four-segment path, parses cluster, namespace, resource plural, and resource name", () => {
    expect(parseLocationBarInput("lc-staging1/bored-system/pods/nginx-abc")).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["bored-system"],
      resourcePluralName: "pods",
      resourceName: "nginx-abc",
    });
  });

  it("given a three-segment path without a resource name, parses cluster, namespace, and resource plural", () => {
    expect(parseLocationBarInput("lc-staging1/default/deployments")).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["default"],
      resourcePluralName: "deployments",
      resourceName: undefined,
    });
  });

  it("given a comma-separated namespace segment, parses multiple namespaces", () => {
    expect(parseLocationBarInput("lc-staging1/default,kube-system/pods")).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["default", "kube-system"],
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("trims whitespace between comma-separated namespaces", () => {
    expect(parseLocationBarInput("lc-staging1/default , kube-system/pods")).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["default", "kube-system"],
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("given a two-segment path, parses cluster and namespace only", () => {
    expect(parseLocationBarInput("lc-staging1/default")).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["default"],
      resourcePluralName: undefined,
      resourceName: undefined,
    });
  });

  it("given a single-segment path, parses the cluster name only", () => {
    expect(parseLocationBarInput("lc-staging1")).toEqual({
      clusterName: "lc-staging1",
      namespaces: undefined,
      resourcePluralName: undefined,
      resourceName: undefined,
    });
  });

  it("given whitespace around segments, trims each segment", () => {
    expect(parseLocationBarInput("  lc-staging1 / default / pods ")).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["default"],
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("given leading and trailing slashes, ignores them", () => {
    expect(parseLocationBarInput("/lc-staging1/default/pods/")).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["default"],
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("given empty segments between slashes, collapses them", () => {
    expect(parseLocationBarInput("lc-staging1//pods")).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["pods"],
      resourcePluralName: undefined,
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
        namespaces: undefined,
        resourcePluralName: undefined,
        resourceName: undefined,
      });
    });

    it("splits namespace/plural/name off after the ARN cluster name", () => {
      expect(parseLocationBarInput(`${arnClusterName}/default/pods/nginx`, [arnClusterName])).toEqual({
        clusterName: arnClusterName,
        namespaces: ["default"],
        resourcePluralName: "pods",
        resourceName: "nginx",
      });
    });

    it("splits comma-separated namespaces after the ARN cluster name", () => {
      expect(parseLocationBarInput(`${arnClusterName}/default,kube-system/pods`, [arnClusterName])).toEqual({
        clusterName: arnClusterName,
        namespaces: ["default", "kube-system"],
        resourcePluralName: "pods",
        resourceName: undefined,
      });
    });

    it("prefers the longest matching cluster name", () => {
      const shortName = "arn:aws:eks:eu-west-1:841310725496:cluster";

      expect(parseLocationBarInput(`${arnClusterName}/default`, [shortName, arnClusterName])).toEqual({
        clusterName: arnClusterName,
        namespaces: ["default"],
        resourcePluralName: undefined,
        resourceName: undefined,
      });
    });

    it("falls back to naive splitting when the input does not match any known cluster", () => {
      expect(parseLocationBarInput(`${arnClusterName}/default`, ["some-other-cluster"])).toEqual({
        clusterName: "arn:aws:eks:eu-west-1:841310725496:cluster",
        namespaces: ["eksdemo1"],
        resourcePluralName: "default",
        resourceName: undefined,
      });
    });
  });
});

describe("resolveLocationSegments", () => {
  describe("given a cluster-scoped resource typed without a namespace segment", () => {
    it("shifts the plural up and drops the namespace", () => {
      expect(
        resolveLocationSegments(
          {
            clusterName: "lc-staging1",
            namespaces: ["nodes"],
            resourcePluralName: undefined,
            resourceName: undefined,
          },
          canResolvePlural,
        ),
      ).toEqual({
        clusterName: "lc-staging1",
        namespaces: undefined,
        resourcePluralName: "nodes",
        resourceName: undefined,
      });
    });

    it("shifts the resource name along with the plural", () => {
      expect(
        resolveLocationSegments(
          {
            clusterName: "lc-staging1",
            namespaces: ["nodes"],
            resourcePluralName: "ip-10-0-0-1",
            resourceName: undefined,
          },
          canResolvePlural,
        ),
      ).toEqual({
        clusterName: "lc-staging1",
        namespaces: undefined,
        resourcePluralName: "nodes",
        resourceName: "ip-10-0-0-1",
      });
    });

    it("shifts for any known plural, not only cluster-scoped ones", () => {
      expect(
        resolveLocationSegments(
          {
            clusterName: "lc-staging1",
            namespaces: ["pods"],
            resourcePluralName: undefined,
            resourceName: undefined,
          },
          canResolvePlural,
        ),
      ).toEqual({
        clusterName: "lc-staging1",
        namespaces: undefined,
        resourcePluralName: "pods",
        resourceName: undefined,
      });
    });

    it("does not shift when multiple namespaces are parsed (they cannot collectively be a misread plural)", () => {
      expect(
        resolveLocationSegments(
          {
            clusterName: "lc-staging1",
            namespaces: ["pods", "extra"],
            resourcePluralName: undefined,
            resourceName: undefined,
          },
          canResolvePlural,
        ),
      ).toEqual({
        clusterName: "lc-staging1",
        namespaces: ["pods", "extra"],
        resourcePluralName: undefined,
        resourceName: undefined,
      });
    });
  });

  it("given an already-valid three-segment path, does not shift when the plural slot resolves", () => {
    expect(
      resolveLocationSegments(
        {
          clusterName: "lc-staging1",
          namespaces: ["default"],
          resourcePluralName: "pods",
          resourceName: undefined,
        },
        canResolvePlural,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["default"],
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("given a four-segment path, does not shift when the plural slot resolves", () => {
    expect(
      resolveLocationSegments(
        {
          clusterName: "lc-staging1",
          namespaces: ["default"],
          resourcePluralName: "pods",
          resourceName: "nginx-abc",
        },
        canResolvePlural,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["default"],
      resourcePluralName: "pods",
      resourceName: "nginx-abc",
    });
  });

  it("given an unknown resource plural in both slots, leaves the input untouched so the navigator can surface the error", () => {
    expect(
      resolveLocationSegments(
        {
          clusterName: "lc-staging1",
          namespaces: ["bogus"],
          resourcePluralName: "also-bogus",
          resourceName: undefined,
        },
        canResolvePlural,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["bogus"],
      resourcePluralName: "also-bogus",
      resourceName: undefined,
    });
  });

  it("given a plausible namespace name in the namespace slot, does not shift when the name is not a known plural", () => {
    expect(
      resolveLocationSegments(
        {
          clusterName: "lc-staging1",
          namespaces: ["monitoring"],
          resourcePluralName: undefined,
          resourceName: undefined,
        },
        canResolvePlural,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      namespaces: ["monitoring"],
      resourcePluralName: undefined,
      resourceName: undefined,
    });
  });
});

const knownPlurals = new Set(["pods", "deployments", "nodes", "persistentvolumes", "clusterroles"]);
const canResolvePlural = (name: string) => knownPlurals.has(name);
