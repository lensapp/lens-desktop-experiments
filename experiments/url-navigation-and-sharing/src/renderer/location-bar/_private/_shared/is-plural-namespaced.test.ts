import { inferScopeFromSamples, makeIsKindNamespaced } from "./is-plural-namespaced";

describe("inferScopeFromSamples", () => {
  it("returns undefined with no samples", () => {
    expect(inferScopeFromSamples([])).toBeUndefined();
  });

  it("returns true when at least one sample has a namespace", () => {
    expect(
      inferScopeFromSamples([
        { metadata: { uid: "1", name: "x", selfLink: "/s", namespace: "default" } },
        { metadata: { uid: "2", name: "y", selfLink: "/s" } },
      ]),
    ).toBe(true);
  });

  it("returns false when every sample lacks a namespace", () => {
    expect(
      inferScopeFromSamples([
        { metadata: { uid: "1", name: "node-1", selfLink: "/s" } },
        { metadata: { uid: "2", name: "node-2", selfLink: "/s" } },
      ]),
    ).toBe(false);
  });

  it("ignores empty-string namespaces (treats them as absent)", () => {
    expect(inferScopeFromSamples([{ metadata: { uid: "1", name: "node-1", selfLink: "/s", namespace: "" } }])).toBe(
      false,
    );
  });
});

describe("makeIsKindNamespaced", () => {
  it("returns false for well-known cluster-scoped plurals without consulting samples", () => {
    const sampleResourcesFor = jest.fn();
    const isKindNamespaced = makeIsKindNamespaced(sampleResourcesFor);

    expect(isKindNamespaced("nodes")).toBe(false);
    expect(isKindNamespaced("customresourcedefinitions")).toBe(false);
    expect(sampleResourcesFor).not.toHaveBeenCalled();
  });

  it("defers to the sample heuristic for plurals not in the known list", () => {
    const isKindNamespaced = makeIsKindNamespaced((plural) => {
      if (plural === "pods") {
        return [{ metadata: { uid: "1", name: "x", selfLink: "/s", namespace: "default" } }];
      }
      if (plural === "myclusterkind") {
        return [{ metadata: { uid: "1", name: "x", selfLink: "/s" } }];
      }
      return undefined;
    });

    expect(isKindNamespaced("pods")).toBe(true);
    expect(isKindNamespaced("myclusterkind")).toBe(false);
    expect(isKindNamespaced("unknown-crd")).toBeUndefined();
  });
});
