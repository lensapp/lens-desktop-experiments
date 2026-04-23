import { buildShareNamespaces, namespacesForShareLink } from "./namespaces-for-share-link";

describe("namespacesForShareLink", () => {
  it("returns undefined when there are no namespaces", () => {
    expect(namespacesForShareLink(undefined)).toBeUndefined();
    expect(namespacesForShareLink([])).toBeUndefined();
  });

  it("returns undefined when only the wildcard is selected", () => {
    expect(namespacesForShareLink(["*"])).toBeUndefined();
  });

  it("strips the wildcard from a mixed selection", () => {
    expect(namespacesForShareLink(["*", "cert-manager"])).toEqual(["cert-manager"]);
  });

  it("preserves a multi-namespace selection", () => {
    expect(namespacesForShareLink(["cert-manager", "kube-system"])).toEqual(["cert-manager", "kube-system"]);
  });
});

describe("buildShareNamespaces", () => {
  it("returns undefined when both filter and object namespace are absent", () => {
    expect(buildShareNamespaces(undefined, undefined)).toBeUndefined();
    expect(buildShareNamespaces([], undefined)).toBeUndefined();
  });

  it("returns only the object namespace when the filter is empty", () => {
    expect(buildShareNamespaces(undefined, "cert-manager")).toEqual(["cert-manager"]);
  });

  it("returns the filter selection when no detail panel is open", () => {
    expect(buildShareNamespaces(["cert-manager", "kube-system"], undefined)).toEqual([
      "cert-manager",
      "kube-system",
    ]);
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
});
