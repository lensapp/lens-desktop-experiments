import { getInjectable } from "@lensapp/injectable";
import { commandsInjectionToken } from "@lensapp/command-palette-renderer";
import { computed } from "mobx";
import { devToolsInjectable } from "./dev-tools.injectable";
import { pipeline } from "@lensapp/fp";
import { flatMap, map } from "lodash/fp";
import { devToolActionsInjectable } from "./dev-tool-actions.injectable";

export const commandPaletteCommandsForActionsInjectable = getInjectable({
  id: "command-palette-commands-for-actions",

  instantiate: (di) => {
    const actionsFor = di.injectFactory(devToolActionsInjectable);
    const devTools = di.inject(devToolsInjectable);

    return computed(() =>
      pipeline(
        devTools.get(),

        map((devTool) => ({ devTool, actions: actionsFor(devTool.id).get() })),

        flatMap(({ devTool, actions }) =>
          actions.map(({ action, name: actionName, id: actionId }) => ({
            id: actionId,

            title: `dev(${devTool.id}): ${actionName}`,

            action,
          })),
        ),
      ),
    );
  },

  injectionToken: commandsInjectionToken,
});
