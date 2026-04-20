import { parseLocationBarInput, resolveLocationSegments } from "./parse-location-bar-input";

describe("parseLocationBarInput", () => {
  describe("given a full four-segment path", () => {
    it("parses cluster, namespace, resource plural, and resource name", () => {
      expect(parseLocationBarInput("lc-staging1/bored-system/pods/nginx-abc")).toEqual({
        clusterName: "lc-staging1",
        namespace: "bored-system",
        resourcePluralName: "pods",
        resourceName: "nginx-abc",
      });
    });
  });

  describe("given a three-segment path without a resource name", () => {
    it("parses cluster, namespace, and resource plural", () => {
      expect(parseLocationBarInput("lc-staging1/default/deployments")).toEqual({
        clusterName: "lc-staging1",
        namespace: "default",
        resourcePluralName: "deployments",
        resourceName: undefined,
      });
    });
  });

  describe("given a two-segment path", () => {
    it("parses cluster and namespace only", () => {
      expect(parseLocationBarInput("lc-staging1/default")).toEqual({
        clusterName: "lc-staging1",
        namespace: "default",
        resourcePluralName: undefined,
        resourceName: undefined,
      });
    });
  });

  describe("given a single-segment path", () => {
    it("parses the cluster name only", () => {
      expect(parseLocationBarInput("lc-staging1")).toEqual({
        clusterName: "lc-staging1",
        namespace: undefined,
        resourcePluralName: undefined,
        resourceName: undefined,
      });
    });
  });

  describe("given whitespace around segments", () => {
    it("trims each segment", () => {
      expect(parseLocationBarInput("  lc-staging1 / default / pods ")).toEqual({
        clusterName: "lc-staging1",
        namespace: "default",
        resourcePluralName: "pods",
        resourceName: undefined,
      });
    });
  });

  describe("given leading and trailing slashes", () => {
    it("ignores them", () => {
      expect(parseLocationBarInput("/lc-staging1/default/pods/")).toEqual({
        clusterName: "lc-staging1",
        namespace: "default",
        resourcePluralName: "pods",
        resourceName: undefined,
      });
    });
  });

  describe("given empty segments between slashes", () => {
    it("collapses them", () => {
      expect(parseLocationBarInput("lc-staging1//pods")).toEqual({
        clusterName: "lc-staging1",
        namespace: "pods",
        resourcePluralName: undefined,
        resourceName: undefined,
      });
    });
  });

  describe("given an empty or whitespace-only string", () => {
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
  const knownPlurals = new Set(["pods", "deployments", "nodes", "persistentvolumes", "clusterroles"]);
  const canResolvePlural = (name: string) => knownPlurals.has(name);

  describe("given a cluster-scoped resource typed without a namespace segment", () => {
    it("shifts the plural up and drops the namespace", () => {
      const parsed = parseLocationBarInput("lc-staging1/nodes");

      expect(resolveLocationSegments(parsed!, canResolvePlural)).toEqual({
        clusterName: "lc-staging1",
        namespace: undefined,
        resourcePluralName: "nodes",
        resourceName: undefined,
      });
    });

    it("shifts the resource name along with the plural", () => {
      const parsed = parseLocationBarInput("lc-staging1/nodes/ip-10-0-0-1");

      expect(resolveLocationSegments(parsed!, canResolvePlural)).toEqual({
        clusterName: "lc-staging1",
        namespace: undefined,
        resourcePluralName: "nodes",
        resourceName: "ip-10-0-0-1",
      });
    });

    it("shifts for any known plural, not only cluster-scoped ones", () => {
      const parsed = parseLocationBarInput("lc-staging1/pods");

      expect(resolveLocationSegments(parsed!, canResolvePlural)).toEqual({
        clusterName: "lc-staging1",
        namespace: undefined,
        resourcePluralName: "pods",
        resourceName: undefined,
      });
    });
  });

  describe("given an already-valid three-segment path", () => {
    it("does not shift when the plural slot resolves", () => {
      const parsed = parseLocationBarInput("lc-staging1/default/pods");

      expect(resolveLocationSegments(parsed!, canResolvePlural)).toEqual(parsed);
    });
  });

  describe("given a four-segment path", () => {
    it("does not shift when the plural slot resolves", () => {
      const parsed = parseLocationBarInput("lc-staging1/default/pods/nginx-abc");

      expect(resolveLocationSegments(parsed!, canResolvePlural)).toEqual(parsed);
    });
  });

  describe("given an unknown resource plural in both slots", () => {
    it("leaves the input untouched so the navigator can surface the error", () => {
      const parsed = parseLocationBarInput("lc-staging1/bogus/also-bogus");

      expect(resolveLocationSegments(parsed!, canResolvePlural)).toEqual(parsed);
    });
  });

  describe("given a plausible namespace name in the namespace slot", () => {
    it("does not shift when the name is not a known plural", () => {
      const parsed = parseLocationBarInput("lc-staging1/monitoring");

      expect(resolveLocationSegments(parsed!, canResolvePlural)).toEqual(parsed);
    });
  });
});
