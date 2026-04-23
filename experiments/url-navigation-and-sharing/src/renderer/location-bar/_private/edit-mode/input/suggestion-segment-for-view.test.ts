import { suggestionSegmentForView } from "./suggestion-segment-for-view";

describe("suggestionSegmentForView", () => {
  describe("when the caret is on the first segment", () => {
    it("labels it as the cluster segment", () => {
      expect(suggestionSegmentForView({ activeSegmentIndex: 0, resolvedIsClusterScoped: false })).toBe("cluster");
    });
  });

  describe("when the caret is on the second segment", () => {
    it("labels it as the resource-type segment", () => {
      expect(suggestionSegmentForView({ activeSegmentIndex: 1, resolvedIsClusterScoped: false })).toBe("resource-type");
    });
  });

  describe("when the caret is on the third segment", () => {
    describe("and the selected resource kind is namespaced", () => {
      it("labels the segment as a namespace", () => {
        expect(suggestionSegmentForView({ activeSegmentIndex: 2, resolvedIsClusterScoped: false })).toBe("namespace");
      });
    });

    describe("and the selected resource kind is cluster-scoped", () => {
      it("labels the segment as a resource name, since cluster-scoped kinds skip the namespace slot", () => {
        expect(suggestionSegmentForView({ activeSegmentIndex: 2, resolvedIsClusterScoped: true })).toBe(
          "resource-name",
        );
      });
    });
  });

  describe("when the caret is on the fourth segment", () => {
    it("labels it as the resource-name segment", () => {
      expect(suggestionSegmentForView({ activeSegmentIndex: 3, resolvedIsClusterScoped: false })).toBe("resource-name");
    });
  });
});
