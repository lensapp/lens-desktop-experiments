import { getInjectableComponent } from "@lensapp/injectable-react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { reactApplicationChildInjectionToken } from "@lensapp/react-application";
import { observer } from "mobx-react";
import { Mapped } from "@lensapp/map";
import { devToolsInjectable } from "./dev-tools.injectable";
import { visibleDevToolsInjectable } from "./visible-dev-tools.injectable";

export const DevToolsAsApplicationChild = getInjectableComponent({
  id: "dev-tools-as-application-child",

  Component: observer(() => {
    const visibleDevTools = useSyncInject(visibleDevToolsInjectable);

    const devTools = useSyncInject(devToolsInjectable)
      .get()
      .filter((x) => visibleDevTools.get(x.id));

    if (devTools.length === 0) {
      return null;
    }

    return <Mapped items={devTools}>{({ Component }) => <Component />}</Mapped>;
  }),

  injectionToken: reactApplicationChildInjectionToken,
});
