import { parseLocationBarInput, resolveLocationSegments } from "./parse-location-bar-input";

describe("parseLocationBarInput", () => {
  it("given a full four-segment path, parses cluster, namespace, resource plural, and resource name", () => {
    expect(parseLocationBarInput("lc-staging1/bored-system/pods/nginx-abc")).toEqual({
      clusterName: "lc-staging1",
      namespace: "bored-system",
      resourcePluralName: "pods",
      resourceName: "nginx-abc",
    });
  });

  it("given a three-segment path without a resource name, parses cluster, namespace, and resource plural", () => {
    expect(parseLocationBarInput("lc-staging1/default/deployments")).toEqual({
      clusterName: "lc-staging1",
      namespace: "default",
      resourcePluralName: "deployments",
      resourceName: undefined,
    });
  });

  it("given a two-segment path, parses cluster and namespace only", () => {
    expect(parseLocationBarInput("lc-staging1/default")).toEqual({
      clusterName: "lc-staging1",
      namespace: "default",
      resourcePluralName: undefined,
      resourceName: undefined,
    });
  });

  it("given a single-segment path, parses the cluster name only", () => {
    expect(parseLocationBarInput("lc-staging1")).toEqual({
      clusterName: "lc-staging1",
      namespace: undefined,
      resourcePluralName: undefined,
      resourceName: undefined,
    });
  });

  it("given whitespace around segments, trims each segment", () => {
    expect(parseLocationBarInput("  lc-staging1 / default / pods ")).toEqual({
      clusterName: "lc-staging1",
      namespace: "default",
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("given leading and trailing slashes, ignores them", () => {
    expect(parseLocationBarInput("/lc-staging1/default/pods/")).toEqual({
      clusterName: "lc-staging1",
      namespace: "default",
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("given empty segments between slashes, collapses them", () => {
    expect(parseLocationBarInput("lc-staging1//pods")).toEqual({
      clusterName: "lc-staging1",
      namespace: "pods",
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
});

describe("resolveLocationSegments", () => {
  describe("given a cluster-scoped resource typed without a namespace segment", () => {
    it("shifts the plural up and drops the namespace", () => {
      expect(
        resolveLocationSegments(
          {
            clusterName: "lc-staging1",
            namespace: "nodes",
            resourcePluralName: undefined,
            resourceName: undefined,
          },
          canResolvePlural,
        ),
      ).toEqual({
        clusterName: "lc-staging1",
        namespace: undefined,
        resourcePluralName: "nodes",
        resourceName: undefined,
      });
    });

    it("shifts the resource name along with the plural", () => {
      expect(
        resolveLocationSegments(
          {
            clusterName: "lc-staging1",
            namespace: "nodes",
            resourcePluralName: "ip-10-0-0-1",
            resourceName: undefined,
          },
          canResolvePlural,
        ),
      ).toEqual({
        clusterName: "lc-staging1",
        namespace: undefined,
        resourcePluralName: "nodes",
        resourceName: "ip-10-0-0-1",
      });
    });

    it("shifts for any known plural, not only cluster-scoped ones", () => {
      expect(
        resolveLocationSegments(
          {
            clusterName: "lc-staging1",
            namespace: "pods",
            resourcePluralName: undefined,
            resourceName: undefined,
          },
          canResolvePlural,
        ),
      ).toEqual({
        clusterName: "lc-staging1",
        namespace: undefined,
        resourcePluralName: "pods",
        resourceName: undefined,
      });
    });
  });

  it("given an already-valid three-segment path, does not shift when the plural slot resolves", () => {
    expect(
      resolveLocationSegments(
        {
          clusterName: "lc-staging1",
          namespace: "default",
          resourcePluralName: "pods",
          resourceName: undefined,
        },
        canResolvePlural,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      namespace: "default",
      resourcePluralName: "pods",
      resourceName: undefined,
    });
  });

  it("given a four-segment path, does not shift when the plural slot resolves", () => {
    expect(
      resolveLocationSegments(
        {
          clusterName: "lc-staging1",
          namespace: "default",
          resourcePluralName: "pods",
          resourceName: "nginx-abc",
        },
        canResolvePlural,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      namespace: "default",
      resourcePluralName: "pods",
      resourceName: "nginx-abc",
    });
  });

  it("given an unknown resource plural in both slots, leaves the input untouched so the navigator can surface the error", () => {
    expect(
      resolveLocationSegments(
        {
          clusterName: "lc-staging1",
          namespace: "bogus",
          resourcePluralName: "also-bogus",
          resourceName: undefined,
        },
        canResolvePlural,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      namespace: "bogus",
      resourcePluralName: "also-bogus",
      resourceName: undefined,
    });
  });

  it("given a plausible namespace name in the namespace slot, does not shift when the name is not a known plural", () => {
    expect(
      resolveLocationSegments(
        {
          clusterName: "lc-staging1",
          namespace: "monitoring",
          resourcePluralName: undefined,
          resourceName: undefined,
        },
        canResolvePlural,
      ),
    ).toEqual({
      clusterName: "lc-staging1",
      namespace: "monitoring",
      resourcePluralName: undefined,
      resourceName: undefined,
    });
  });
});

const knownPlurals = new Set(["pods", "deployments", "nodes", "persistentvolumes", "clusterroles"]);
const canResolvePlural = (name: string) => knownPlurals.has(name);
