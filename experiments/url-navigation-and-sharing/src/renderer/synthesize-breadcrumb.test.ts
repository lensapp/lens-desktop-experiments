import { synthesizeBreadcrumb } from "./synthesize-breadcrumb";

describe("synthesizeBreadcrumb", () => {
  describe("when there is no active cluster", () => {
    it("returns a single coarse non-cluster label", () => {
      const segments = synthesizeBreadcrumb({
        clusterName: undefined,
        namespaces: undefined,
        resourceType: undefined,
        resourceName: undefined,
      });

      expect(segments).toEqual(["Lens"]);
    });

    it("ignores any other inputs once cluster is missing", () => {
      const segments = synthesizeBreadcrumb({
        clusterName: undefined,
        namespaces: ["kube-system"],
        resourceType: "pods",
        resourceName: "nginx",
      });

      expect(segments).toEqual(["Lens"]);
    });
  });

  describe("when an active cluster is selected", () => {
    it("shows cluster / namespace / resource-type in the cluster-list view", () => {
      const segments = synthesizeBreadcrumb({
        clusterName: "production",
        namespaces: ["default"],
        resourceType: "pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["production", "default", "pods"]);
    });

    it("appends the resource name when the detail panel is open", () => {
      const segments = synthesizeBreadcrumb({
        clusterName: "production",
        namespaces: ["default"],
        resourceType: "pods",
        resourceName: "nginx-abc123",
      });

      expect(segments).toEqual(["production", "default", "pods", "nginx-abc123"]);
    });

    it("collapses multi-namespace selections into an aggregate count", () => {
      const segments = synthesizeBreadcrumb({
        clusterName: "production",
        namespaces: ["default", "kube-system", "monitoring"],
        resourceType: "pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["production", "3 namespaces", "pods"]);
    });

    it('renders "All namespaces" when the wildcard selection is active', () => {
      const segments = synthesizeBreadcrumb({
        clusterName: "production",
        namespaces: ["*"],
        resourceType: "pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["production", "All namespaces", "pods"]);
    });

    it("renders a placeholder glyph when no namespaces are selected at all", () => {
      const segments = synthesizeBreadcrumb({
        clusterName: "production",
        namespaces: [],
        resourceType: "pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["production", "—", "pods"]);
    });

    it("omits the namespace segment while selected-namespaces data is still resolving", () => {
      const segments = synthesizeBreadcrumb({
        clusterName: "production",
        namespaces: undefined,
        resourceType: "pods",
        resourceName: undefined,
      });

      expect(segments).toEqual(["production", "pods"]);
    });

    it("omits the resource-type segment when no tab is selected in the cluster", () => {
      const segments = synthesizeBreadcrumb({
        clusterName: "production",
        namespaces: ["default"],
        resourceType: undefined,
        resourceName: undefined,
      });

      expect(segments).toEqual(["production", "default"]);
    });
  });
});
