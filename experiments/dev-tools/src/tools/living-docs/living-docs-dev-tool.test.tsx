import { createContainer, getInjectable, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { devToolInjectionToken } from "../../in-general/dev-tool";
import { act, type RenderResult } from "@testing-library/react";
import { discoverFor, type Discover } from "@lensapp/react-testing-library-discovery";
import { renderFor, type DiRender } from "@lensapp/rendering-test-utils";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";
import type { InjectableComponent } from "@lensapp/injectable-react";
import type { JSX } from "react";
import { livingDocsDevToolInjectable } from "./living-docs-dev-tool.injectable";
import { livingDocsDevToolFeature } from "./feature";
import { runInAction } from "mobx";
import { livingDocsEntryInjectionToken } from "@lensapp/living-docs";

describe("living-docs-dev-tool", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, livingDocsDevToolFeature);
    runAllTestUtilityRunnables(di);
  });

  it("is dev tool", () => {
    expect(livingDocsDevToolInjectable.injectionToken).toBe(devToolInjectionToken);
  });

  describe("given components catalog dev tool and some component item", () => {
    let render: DiRender;
    let rendered: RenderResult;
    let discover: Discover;
    let Component: InjectableComponent<() => JSX.Element>;

    beforeEach(async () => {
      const someLivingDocsItem = getInjectable({
        id: "some-living-docs-item",
        instantiate: () => ({
          id: "some-living-docs-item-id",
          title: "Some Components Catalog Item",
          description: "This is some components catalog item for testing.",
          Component: () => (
            <div data-some-living-docs-item-test={"some-living-docs-item-id"}>Some Components Catalog Item</div>
          ),
        }),
        injectionToken: livingDocsEntryInjectionToken,
      });

      runInAction(() => {
        di.register(someLivingDocsItem);
      });

      render = renderFor(di);
      Component = di.inject(livingDocsDevToolInjectable).Component;

      rendered = await render(<Component />);
      discover = discoverFor(() => rendered);
    });

    it("renders", async () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders components catalog item", async () => {
      expect(
        discover.getSingleElement("some-living-docs-item", "some-living-docs-item-id").discovered,
      ).toBeInTheDocument();
    });

    it("renders components catalog item title", async () => {
      expect(
        discover.getSingleElement("living-docs-item-title", "some-living-docs-item-id").discovered,
      ).toHaveTextContent("Some Components Catalog Item");
    });

    it("renders components catalog item description", async () => {
      expect(
        discover.getSingleElement("living-docs-item-description", "some-living-docs-item-id").discovered,
      ).toHaveTextContent("This is some components catalog item for testing.");
    });

    describe("when new component item emerges", () => {
      beforeEach(async () => {
        const anotherLivingDocsItem = getInjectable({
          id: "another-living-docs-item",

          instantiate: () => ({
            id: "some-other-living-docs-item-id",
            title: "Some other Components Catalog Item",
            description: "This is some other components catalog item for testing.",

            Component: () => (
              <div data-some-living-docs-item-test="some-other-living-docs-item-id">
                Some Other Components Catalog Item
              </div>
            ),
          }),

          injectionToken: livingDocsEntryInjectionToken,
        });

        await act(async () => {
          runInAction(() => {
            di.register(anotherLivingDocsItem);
          });
        });
      });

      it("renders the new component", async () => {
        expect(
          discover.getSingleElement("some-living-docs-item", "some-other-living-docs-item-id").discovered,
        ).toBeInTheDocument();
      });
    });
  });
});
