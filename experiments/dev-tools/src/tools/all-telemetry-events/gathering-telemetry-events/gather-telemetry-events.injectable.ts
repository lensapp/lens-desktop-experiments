import { getMessageChannelListenerInjectable } from "@lensapp/messaging";
import { telemetryBroadcastChannel } from "@lensapp/telemetry";
import { telemetryEventsInjectable } from "../_shared/telemetry-events.injectable";
import { runInAction } from "mobx";

export const gatherTelemetryEventsInjectable = getMessageChannelListenerInjectable({
  id: "gather-telemetry-events",

  channel: telemetryBroadcastChannel,

  getHandler: (di) => (event) => {
    const telemetryEvents = di.inject(telemetryEventsInjectable);

    runInAction(() => {
      telemetryEvents.add(event);
    });
  },
});
