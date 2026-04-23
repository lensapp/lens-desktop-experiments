import { getInjectable } from "@lensapp/injectable";
import { sendTelemetryEventInjectionToken } from "@lensapp/telemetry";
import { deferAwait } from "@lensapp/utilities";
import type { LocationBarTelemetryEvent } from "./location-bar-telemetry-event";

const experimentTelemetryName = "url-navigation-and-sharing";

export type SendLocationBarTelemetry = (event: LocationBarTelemetryEvent) => void;

const sendLocationBarTelemetryInjectable = getInjectable({
  id: "url-navigation-and-sharing-send-location-bar-telemetry",

  instantiate: (di): SendLocationBarTelemetry => {
    const sendTelemetryEvent = deferAwait(di.inject(sendTelemetryEventInjectionToken));

    return (event) => {
      void sendTelemetryEvent({
        name: experimentTelemetryName,
        action: event.action,
        userInteraction: true,
        params: event.params,
      });
    };
  },
});

export default sendLocationBarTelemetryInjectable;
