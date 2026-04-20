import { isLensUrl, parseLensUrl } from "./parse-lens-url";

describe("isLensUrl", () => {
  it("recognises a bare lens:// URL", () => {
    expect(isLensUrl("lens://app/open/direct/abc/cluster/pods")).toBe(true);
  });

  it("tolerates leading whitespace from sloppy paste", () => {
    expect(isLensUrl("   lens://app/open/direct/abc/cluster/pods")).toBe(true);
  });

  it("rejects a non-lens URL", () => {
    expect(isLensUrl("https://app.k8slens.dev/lens-launcher?c=lens%3A%2F%2F")).toBe(false);
  });

  it("rejects a typed breadcrumb path", () => {
    expect(isLensUrl("lc-staging1/default/pods")).toBe(false);
  });
});

describe("parseLensUrl", () => {
  describe("given a direct-connection pods tab URL", () => {
    it("extracts connection type, cluster specifier, and tail", () => {
      const parsed = parseLensUrl("lens://app/open/direct/a7ffc6f8bf1ed76651c14756a061d662/cluster/pods");

      expect(parsed).toEqual({
        connectionType: "direct",
        clusterSpecifier: "a7ffc6f8bf1ed76651c14756a061d662",
        tail: "/pods",
        search: {},
      });
    });
  });

  describe("given a teamwork (Lens Spaces) pods tab URL", () => {
    it("extracts the stable cluster id as the specifier", () => {
      const parsed = parseLensUrl("lens://app/open/teamwork/stable-cluster-id/cluster/pods");

      expect(parsed).toEqual({
        connectionType: "teamwork",
        clusterSpecifier: "stable-cluster-id",
        tail: "/pods",
        search: {},
      });
    });
  });

  describe("given a URL with a kube-details selfLink", () => {
    it("surfaces the query parameter URL-decoded", () => {
      const parsed = parseLensUrl(
        "lens://app/open/direct/abc/cluster/pods?kube-details=%2Fapi%2Fv1%2Fnamespaces%2Flenscloud%2Fpods%2Ftrow-0",
      );

      expect(parsed).toEqual({
        connectionType: "direct",
        clusterSpecifier: "abc",
        tail: "/pods",
        search: { "kube-details": "/api/v1/namespaces/lenscloud/pods/trow-0" },
      });
    });
  });

  describe("given a URL with no tail after the frame", () => {
    it("returns an empty-string tail", () => {
      const parsed = parseLensUrl("lens://app/open/direct/abc/cluster");

      expect(parsed).toEqual({
        connectionType: "direct",
        clusterSpecifier: "abc",
        tail: "",
        search: {},
      });
    });
  });

  describe("given a multi-segment tail (apiGroup + plural)", () => {
    it("preserves the full tail path", () => {
      const parsed = parseLensUrl("lens://app/open/direct/abc/cluster/apis/apps/deployments");

      expect(parsed).toEqual({
        connectionType: "direct",
        clusterSpecifier: "abc",
        tail: "/apis/apps/deployments",
        search: {},
      });
    });
  });

  describe("given a malformed URL", () => {
    it("returns undefined for a non-lens scheme", () => {
      expect(parseLensUrl("https://example.com/foo")).toBeUndefined();
    });

    it("returns undefined when the host is not 'app'", () => {
      expect(parseLensUrl("lens://other/open/direct/abc/cluster/pods")).toBeUndefined();
    });

    it("returns undefined when the base path segment is not 'open'", () => {
      expect(parseLensUrl("lens://app/close/direct/abc/cluster/pods")).toBeUndefined();
    });

    it("returns undefined when the cluster specifier is missing", () => {
      expect(parseLensUrl("lens://app/open/direct")).toBeUndefined();
    });

    it("returns undefined when the frame is missing", () => {
      expect(parseLensUrl("lens://app/open/direct/abc")).toBeUndefined();
    });

    it("returns undefined for an empty string", () => {
      expect(parseLensUrl("")).toBeUndefined();
    });
  });
});
