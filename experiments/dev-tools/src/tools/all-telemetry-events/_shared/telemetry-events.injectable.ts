import { getInjectable } from "@lensapp/injectable";
import type { TelemetryEvent } from "@lensapp/telemetry";
import { observable } from "mobx";

export const telemetryEventsInjectable = getInjectable({
  id: "telemetry-events",
  instantiate: () => observable.set<TelemetryEvent>(),
});
