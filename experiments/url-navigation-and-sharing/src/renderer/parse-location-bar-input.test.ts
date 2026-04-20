import { parseLocationBarInput } from "./parse-location-bar-input";

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
