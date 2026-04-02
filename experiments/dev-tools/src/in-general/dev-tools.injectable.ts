import { getInjectable } from "@lensapp/injectable";
import { devToolInjectionToken } from "./dev-tool";
import { computedInjectManyInjectionToken } from "@lensapp/injectable-extension-for-mobx";
import { computed } from "mobx";
import { orderBy } from "lodash/fp";
import { pipeline } from "@lensapp/fp";

export const devToolsInjectable = getInjectable({
  id: "dev-tools",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectionToken);

    const toolsWithIds = computedInjectMany(devToolInjectionToken);

    return computed(() => pipeline(toolsWithIds.get(), (tools) => orderBy((tool) => tool.id, ["asc"], tools)));
  },
});
