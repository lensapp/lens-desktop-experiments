import { getInjectable } from "@lensapp/injectable";
import { computedInjectManyWithMetaInjectionToken } from "@lensapp/injectable-extension-for-mobx";
import { computed } from "mobx";
import { map } from "lodash/fp";
import { pipeline } from "@lensapp/fp";
import { devToolActionInjectionToken } from "./dev-tool-action";
import { getKeyedSingletonLifecycle } from "@lensapp/utilities";

export const devToolActionsInjectable = getInjectable({
  id: "dev-tool-actions",

  instantiate: (di, devToolId) => {
    const computedInjectMany = di.inject(computedInjectManyWithMetaInjectionToken);

    const actionsWithIds = computedInjectMany(devToolActionInjectionToken.for(devToolId));

    return computed(() =>
      pipeline(
        actionsWithIds.get(),

        map(({ meta, instance }) => ({
          id: meta.id,
          action: instance.action,
          name: instance.name,
        })),
      ),
    );
  },

  lifecycle: getKeyedSingletonLifecycle<string>(),
});
