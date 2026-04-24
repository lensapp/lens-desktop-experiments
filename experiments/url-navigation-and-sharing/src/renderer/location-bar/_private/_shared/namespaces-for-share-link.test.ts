import { buildShareNamespaces } from "./namespaces-for-share-link";

describe("buildShareNamespaces", () => {
  it("returns undefined when both filter and object namespace are absent", () => {
    expect(buildShareNamespaces(undefined, undefined)).toBeUndefined();
    expect(buildShareNamespaces([], undefined)).toBeUndefined();
  });

  it("returns only the object namespace when the filter is empty", () => {
    expect(buildShareNamespaces(undefined, "cert-manager")).toEqual(["cert-manager"]);
  });

  it("returns the filter selection when no detail panel is open", () => {
    expect(buildShareNamespaces(["cert-manager", "kube-system"], undefined)).toEqual(["cert-manager", "kube-system"]);
  });

  it("preserves the filter selection when the object namespace is already part of it", () => {
    expect(buildShareNamespaces(["cert-manager", "kube-system"], "cert-manager")).toEqual([
      "cert-manager",
      "kube-system",
    ]);
  });

  it("appends the object namespace when it is not part of the filter selection", () => {
    expect(buildShareNamespaces(["cert-manager", "kube-system"], "default")).toEqual([
      "cert-manager",
      "kube-system",
      "default",
    ]);
  });

  it("preserves the all-namespaces wildcard as the whole share namespace segment", () => {
    expect(buildShareNamespaces(["*"], undefined)).toEqual(["*"]);
  });

  it("keeps the wildcard alone even when a detail panel is open — * already covers the object's namespace", () => {
    expect(buildShareNamespaces(["*"], "cert-manager")).toEqual(["*"]);
  });
});
