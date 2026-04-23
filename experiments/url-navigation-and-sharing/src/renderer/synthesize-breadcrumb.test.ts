import { synthesizeClusterBreadcrumb } from "./synthesize-breadcrumb";

describe("synthesizeClusterBreadcrumb", () => {
  describe("given a namespaced resource tab", () => {
    it("shows cluster, resource plural, and namespace", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["bored-system"],
        resourcePath: "/api/pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "pods", "bored-system"]);
    });

    it("extracts the plural from a path that includes a group and version prefix", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/apis/apps/deployments",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "deployments", "default"]);
    });

    it("ignores a trailing slash when extracting the plural", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/api/pods/",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "pods", "default"]);
    });

    describe("and a resource is focused in the detail panel", () => {
      it("appends the resource name as the final segment", () => {
        const segments = synthesizeClusterBreadcrumb({
          clusterName: "lc-staging1",
          namespaces: ["bored-system"],
          resourcePath: "/api/pods",
          resourceName: "nginx-abc123",
        });

        expect(segments).toEqual(["lc-staging1", "pods", "bored-system", "nginx-abc123"]);
      });
    });
  });

  describe("given no resource tab", () => {
    it("still shows the namespace segment so the filter is visible", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: undefined,
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "default"]);
    });
  });

  describe("given the selected-namespaces data is still resolving", () => {
    it("omits the namespace segment instead of showing a placeholder", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: undefined,
        resourcePath: "/api/pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "pods"]);
    });
  });

  describe("given an explicit namespace selection", () => {
    it("renders the single namespace name after the plural", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["monitoring"],
        resourcePath: "/api/pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "pods", "monitoring"]);
    });

    it("aggregates multiple namespaces into a count", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["default", "kube-system", "monitoring"],
        resourcePath: "/api/pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "pods", "3 namespaces"]);
    });

    it('renders "All namespaces" when the wildcard selection is active', () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["*"],
        resourcePath: "/api/pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "pods", "All namespaces"]);
    });

    it("renders a placeholder glyph when no namespaces are selected at all", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: [],
        resourcePath: "/api/pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "pods", "—"]);
    });
  });

  describe("given a cluster-scoped resource", () => {
    it("skips the namespace segment for /api/nodes even when a namespace filter is active", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/api/nodes",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "nodes"]);
    });

    it("skips the namespace segment for cluster roles under an RBAC api group", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/apis/rbac.authorization.k8s.io/clusterroles",
        resourceName: undefined,
      });

      expect(segments).toEqual(["lc-staging1", "clusterroles"]);
    });

    it("still shows the selected resource name when the detail panel is open", () => {
      const segments = synthesizeClusterBreadcrumb({
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/api/nodes",
        resourceName: "ip-10-0-0-1",
      });

      expect(segments).toEqual(["lc-staging1", "nodes", "ip-10-0-0-1"]);
    });
  });
});
