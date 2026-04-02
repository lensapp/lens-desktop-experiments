import { getInjectable } from "@lensapp/injectable";
import { commandsInjectionToken } from "@lensapp/command-palette-renderer";
import { computed, runInAction } from "mobx";
import { devToolsInjectable } from "./dev-tools.injectable";
import { pipeline } from "@lensapp/fp";
import { map } from "lodash/fp";
import { visibleDevToolsInjectable } from "./visible-dev-tools.injectable";

export const commandPaletteCommandsForTogglingInjectable = getInjectable({
  id: "command-palette-commands-for-toggling",

  instantiate: (di) => {
    const devTools = di.inject(devToolsInjectable);
    const visibleDevTools = di.inject(visibleDevToolsInjectable);

    return computed(() =>
      pipeline(
        devTools.get(),

        map((x) => ({
          id: x.id,
          title: `dev(${x.id}): Toggle`,

          action: () => {
            const existingValue = visibleDevTools.get(x.id);

            runInAction(() => {
              visibleDevTools.set(x.id, existingValue === undefined ? true : !existingValue);
            });
          },
        })),
      ),
    );
  },

  injectionToken: commandsInjectionToken,
});
