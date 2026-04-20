import { synthesizeBreadcrumb } from "./synthesize-breadcrumb";

const emptyInput = {
  clusterName: undefined,
  namespaces: undefined,
  resourcePath: undefined,
  resourceName: undefined,
  nonClusterLabel: undefined,
};

describe("synthesizeBreadcrumb", () => {
  describe("when there is no active cluster", () => {
    it('returns a default "Lens" label when no non-cluster label is supplied', () => {
      const segments = synthesizeBreadcrumb(emptyInput);

      expect(segments).toEqual(["Lens"]);
    });

    it("shows the non-cluster label when the user is on a non-cluster tab", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        nonClusterLabel: "Preferences",
      });

      expect(segments).toEqual(["Preferences"]);
    });

    it("ignores any cluster-related inputs once cluster is missing", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        namespaces: ["kube-system"],
        resourcePath: "/api/pods",
        resourceName: "nginx",
        nonClusterLabel: "Welcome",
      });

      expect(segments).toEqual(["Welcome"]);
    });
  });

  describe("when an active cluster is selected", () => {
    it("shows cluster / namespace / resource-plural in the cluster-list view", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: ["bored-system"],
        resourcePath: "/api/pods",
      });

      expect(segments).toEqual(["lc-staging1", "bored-system", "pods"]);
    });

    it("appends the resource name when the detail panel is open", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: ["bored-system"],
        resourcePath: "/api/pods",
        resourceName: "nginx-abc123",
      });

      expect(segments).toEqual(["lc-staging1", "bored-system", "pods", "nginx-abc123"]);
    });

    it("extracts the plural name from a path with a group and version prefix", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/apis/apps/deployments",
      });

      expect(segments).toEqual(["lc-staging1", "default", "deployments"]);
    });

    it("collapses multi-namespace selections into an aggregate count", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: ["default", "kube-system", "monitoring"],
        resourcePath: "/api/pods",
      });

      expect(segments).toEqual(["lc-staging1", "3 namespaces", "pods"]);
    });

    it('renders "All namespaces" when the wildcard selection is active', () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: [allNamespacesSelectedValue()],
        resourcePath: "/api/pods",
      });

      expect(segments).toEqual(["lc-staging1", "All namespaces", "pods"]);
    });

    it("renders a placeholder glyph when no namespaces are selected at all", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: [],
        resourcePath: "/api/pods",
      });

      expect(segments).toEqual(["lc-staging1", "—", "pods"]);
    });

    it("omits the namespace segment while selected-namespaces data is still resolving", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: undefined,
        resourcePath: "/api/pods",
      });

      expect(segments).toEqual(["lc-staging1", "pods"]);
    });

    it("omits the resource-type segment when no tab is selected in the cluster", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: ["default"],
      });

      expect(segments).toEqual(["lc-staging1", "default"]);
    });
  });

  describe("when the selected resource is cluster-scoped", () => {
    it("skips the namespace segment for /api/nodes even when a namespace filter is active", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/api/nodes",
      });

      expect(segments).toEqual(["lc-staging1", "nodes"]);
    });

    it("skips the namespace segment for cluster roles under an RBAC api group", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/apis/rbac.authorization.k8s.io/clusterroles",
      });

      expect(segments).toEqual(["lc-staging1", "clusterroles"]);
    });

    it("still shows the selected resource name for a cluster-scoped tab with an open detail panel", () => {
      const segments = synthesizeBreadcrumb({
        ...emptyInput,
        clusterName: "lc-staging1",
        namespaces: ["default"],
        resourcePath: "/api/nodes",
        resourceName: "ip-10-0-0-1",
      });

      expect(segments).toEqual(["lc-staging1", "nodes", "ip-10-0-0-1"]);
    });
  });
});

const allNamespacesSelectedValue = (): string => "*";
