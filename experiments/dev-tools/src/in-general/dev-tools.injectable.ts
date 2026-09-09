import { getInjectable } from "@k8slens/injectable";
import { devToolInjectionToken } from "./dev-tool";
import { computedInjectManyInjectionToken } from "@k8slens/injectable-extension-for-mobx";
import { computed } from "mobx";
import { orderBy } from "lodash/fp";
import { pipeline } from "@k8slens/fp";

export const devToolsInjectable = getInjectable({
  id: "dev-tools",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectionToken);

    const toolsWithIds = computedInjectMany(devToolInjectionToken);

    return computed(() => pipeline(toolsWithIds.get(), (tools) => orderBy((tool) => tool.id, ["asc"], tools)));
  },
});
