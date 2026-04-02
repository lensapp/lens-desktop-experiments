import { createContainer, type DiContainer } from "@lensapp/injectable";
import { allIconsDevToolFeature } from "./feature";
import { registerFeature } from "@lensapp/feature-core";
import { renderAllIconsDevToolInjectable } from "./render-all-icons-dev-tool.injectable";
import { devToolInjectionToken } from "../../in-general/dev-tool";
import type { RenderResult } from "@testing-library/react";
import { type Discover, discoverFor } from "@lensapp/react-testing-library-discovery";
import { renderFor } from "@lensapp/rendering-test-utils";
import { AllExportsFromIconInjectable } from "./render-all-icons.injectable";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";

describe("all-icons-dev-tool", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, allIconsDevToolFeature);

    runAllTestUtilityRunnables(di);

    di.override(
      AllExportsFromIconInjectable,
      () =>
        ({
          SomeIcon: () => <div>Some Icon</div>,
          SomeOtherIcon: () => <div>Some Icon</div>,
          SomeNonComponent: 42,
          SomeObject: {},
        }) as any,
    );
  });

  it("is dev tool", () => {
    expect(renderAllIconsDevToolInjectable.injectionToken).toBe(devToolInjectionToken);
  });

  describe("when rendered", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      const render = renderFor(di);

      const { Component } = di.inject(renderAllIconsDevToolInjectable);

      rendered = await render(<Component />);

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders all icons", () => {
      expect(discover.queryAllElements("icon").attributeValues).toEqual(["SomeIcon", "SomeOtherIcon"]);
    });

    describe("when searching", () => {
      beforeEach(async () => {
        await discover.getSingleElement("icon-search-input").type("other");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows only the icons matching the search", () => {
        expect(discover.queryAllElements("icon").attributeValues).toEqual(["SomeOtherIcon"]);
      });
    });
  });
});
