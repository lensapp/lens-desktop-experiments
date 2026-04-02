import { createContainer, getInjectable, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { devToolsFeature } from "./feature";
import { renderFor } from "@lensapp/rendering-test-utils";
import { DevToolsAsApplicationChild } from "./dev-tools-as-application-child.injectable";
import { reactApplicationChildInjectionToken } from "@lensapp/react-application";
import type { RenderResult } from "@testing-library/react";
import { type Discover, discoverFor } from "@lensapp/react-testing-library-discovery";
import { devToolInjectionToken } from "./dev-tool";
import { act } from "react";
import { commandPaletteCommandsForTogglingInjectable } from "./command-palette-commands-for-toggling.injectable";
import { autorun } from "mobx";
import { type Command, commandsInjectionToken } from "@lensapp/command-palette-renderer";
import { commandPaletteCommandsForActionsInjectable } from "./command-palette-commands-for-actions.injectable";
import { devToolActionInjectionToken } from "./dev-tool-action";

describe("dev-tools-in-general", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, devToolsFeature);
  });

  it("is react application child", () => {
    expect(DevToolsAsApplicationChild.injectionToken).toBe(reactApplicationChildInjectionToken);
  });

  describe("when rendered", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      const render = renderFor(di);

      rendered = await render(<DevToolsAsApplicationChild />);

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not render dev tools", () => {
      expect(discover.querySingleElement("dev-tools").discovered).not.toBeInTheDocument();
    });

    describe("when a dev tool emerges", () => {
      let actualCommandPaletteCommandsForToggling: Command[];

      beforeEach(async () => {
        await act(async () => {
          di.register(someDevToolInjectable);
        });

        const commandPaletteCommandsForToggling = di.inject(commandPaletteCommandsForTogglingInjectable);

        autorun(() => {
          actualCommandPaletteCommandsForToggling = commandPaletteCommandsForToggling.get();
        });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("still does not render dev tools", () => {
        expect(discover.querySingleElement("dev-tools").discovered).not.toBeInTheDocument();
      });

      it("has command palette action for toggling", () => {
        expect(actualCommandPaletteCommandsForToggling).toEqual([
          { action: expect.any(Function), id: "some-dev-tool", title: "dev(some-dev-tool): Toggle" },
        ]);
      });

      describe("when a dev tool is toggled to be visible", () => {
        beforeEach(async () => {
          const toggleAction = actualCommandPaletteCommandsForToggling.at(0)!;

          await act(async () => {
            (await toggleAction.action)();
          });
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("renders the dev tool", () => {
          expect(discover.getSingleElement("dev-tool").discovered).toBeInTheDocument();
        });

        describe("when the dev tool is toggled to be hidden", () => {
          beforeEach(async () => {
            const toggleAction = actualCommandPaletteCommandsForToggling.at(0)!;

            await act(async () => {
              (await toggleAction.action)();
            });
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("no longer renders the dev tool", () => {
            expect(discover.querySingleElement("dev-tool").discovered).not.toBeInTheDocument();
          });
        });
      });
    });
  });

  describe("command palette commands for toggling", () => {
    it("is implementation of commands", () => {
      expect(commandPaletteCommandsForTogglingInjectable.injectionToken).toBe(commandsInjectionToken);
    });
  });

  describe("command palette commands for actions", () => {
    let actualCommandPaletteCommandsForActions: Command[];

    beforeEach(() => {
      const actions = di.inject(commandPaletteCommandsForActionsInjectable);

      autorun(() => {
        actualCommandPaletteCommandsForActions = actions.get();
      });
    });

    it("is implementation of commands", () => {
      expect(commandPaletteCommandsForActionsInjectable.injectionToken).toBe(commandsInjectionToken);
    });

    it("does not have actions yet", () => {
      expect(actualCommandPaletteCommandsForActions).toEqual([]);
    });

    describe("when action emerges for unknown dev tool", () => {
      let actionMock: jest.Mock;

      beforeEach(async () => {
        actionMock = jest.fn();

        const someActionInjectable = getInjectable({
          id: "some-action",
          instantiate: () => ({
            name: "some-action-name",
            action: actionMock,
          }),

          injectionToken: devToolActionInjectionToken.for("some-dev-tool"),
        });

        await act(async () => {
          di.register(someActionInjectable);
        });
      });

      it("still does not have the action for dev tool being unknown", () => {
        expect(actualCommandPaletteCommandsForActions).toEqual([]);
      });

      describe("when the dev tool emerges", () => {
        beforeEach(async () => {
          await act(async () => {
            di.register(someDevToolInjectable);
          });
        });

        it("has the action for dev tool", () => {
          expect(actualCommandPaletteCommandsForActions).toEqual([
            {
              action: expect.any(Function),
              id: "some-action",
              title: "dev(some-dev-tool): some-action-name",
            },
          ]);
        });

        it("does not call the action yet", () => {
          expect(actionMock).not.toHaveBeenCalled();
        });

        it("when the action is triggered, does so", async () => {
          const command = actualCommandPaletteCommandsForActions.at(0)!;

          (await command.action)();

          expect(actionMock).toHaveBeenCalled();
        });
      });
    });
  });
});

const someDevToolInjectable = getInjectable({
  id: "irrelevant-dev-tool-id",

  instantiate: () => ({
    id: "some-dev-tool",
    name: "Some dev tool",
    Component: () => <div data-dev-tool-test>Some dev tool</div>,
  }),

  injectionToken: devToolInjectionToken,
});
