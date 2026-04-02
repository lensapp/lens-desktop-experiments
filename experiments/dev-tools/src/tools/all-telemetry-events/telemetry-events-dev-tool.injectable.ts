import { getInjectable } from "@lensapp/injectable";
import { TelemetryEvents } from "./telemetry-events.injectable";
import { devToolInjectionToken } from "../../in-general/dev-tool";

export const telemetryEventsDevToolId = "telemetry-events-dev-tool";

export const telemetryEventsDevToolInjectable = getInjectable({
  id: "telemetry-events-dev-tool",

  instantiate: () => ({
    id: telemetryEventsDevToolId,
    Component: TelemetryEvents,
  }),

  injectionToken: devToolInjectionToken,
});
