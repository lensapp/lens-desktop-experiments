import {
  suggestClusters,
  suggestNamespaces,
  suggestResourceNames,
  suggestResourcePlurals,
} from "./location-bar-suggestions";

describe("suggestClusters", () => {
  it("returns every name when the query is empty", () => {
    expect(suggestClusters(["a", "b", "c"], "")).toHaveLength(3);
  });

  it("filters case-insensitively by substring", () => {
    const result = suggestClusters(["minikube", "EKS-prod", "aks"], "ks");

    expect(result.map((s) => s.label)).toEqual(["EKS-prod", "aks"]);
  });

  it("returns insertText matching the label", () => {
    const [first] = suggestClusters(["minikube"], "min");

    expect(first).toEqual({ label: "minikube", insertText: "minikube" });
  });

  it("dedupes repeated names while preserving input order", () => {
    const result = suggestClusters(["eks", "aks", "eks"], "");

    expect(result.map((s) => s.label)).toEqual(["eks", "aks"]);
  });

  it("caps results at the provided limit", () => {
    const input = Array.from({ length: 20 }, (_, i) => `cluster-${i}`);

    expect(suggestClusters(input, "", 3)).toHaveLength(3);
  });
});

describe("suggestNamespaces", () => {
  it("filters by substring", () => {
    const result = suggestNamespaces(["kube-system", "kube-public", "default"], "kube");

    expect(result.map((s) => s.label)).toEqual(["kube-system", "kube-public"]);
  });

  it("returns nothing when no namespace matches", () => {
    expect(suggestNamespaces(["default"], "nope")).toEqual([]);
  });
});

describe("suggestResourcePlurals", () => {
  it("filters by substring", () => {
    const plurals = ["deployments", "daemonsets", "pods", "services"];

    expect(suggestResourcePlurals(plurals, "de").map((s) => s.label)).toEqual(["deployments"]);
  });

  it("matches substrings anywhere in the name", () => {
    const plurals = ["deployments", "daemonsets", "statefulsets"];

    expect(suggestResourcePlurals(plurals, "sets").map((s) => s.label)).toEqual(["daemonsets", "statefulsets"]);
  });

  it("is case-insensitive", () => {
    expect(suggestResourcePlurals(["Deployments"], "dep").map((s) => s.label)).toEqual(["Deployments"]);
  });
});

describe("suggestResourceNames", () => {
  it("returns every name when the query is empty", () => {
    expect(suggestResourceNames(["pod-a", "pod-b"], "")).toHaveLength(2);
  });

  it("filters by substring", () => {
    const result = suggestResourceNames(["nginx-1", "redis-1", "nginx-2"], "nginx");

    expect(result.map((s) => s.label)).toEqual(["nginx-1", "nginx-2"]);
  });
});
