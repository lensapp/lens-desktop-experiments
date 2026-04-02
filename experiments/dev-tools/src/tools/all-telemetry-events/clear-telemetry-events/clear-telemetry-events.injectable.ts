import { getInjectable } from "@lensapp/injectable";
import { runInAction } from "mobx";
import { telemetryEventsInjectable } from "../_shared/telemetry-events.injectable";
import { devToolActionInjectionToken } from "../../../in-general/dev-tool-action";
import { telemetryEventsDevToolId } from "../telemetry-events-dev-tool.injectable";

export const clearTelemetryEventsInjectable = getInjectable({
  id: "clear-telemetry-events",

  instantiate: (di) => {
    const telemetryEvents = di.inject(telemetryEventsInjectable);

    return {
      name: "Clear telemetry events",

      action: () => {
        runInAction(() => {
          telemetryEvents.clear();
        });
      },
    };
  },

  injectionToken: devToolActionInjectionToken.for(telemetryEventsDevToolId),
});
