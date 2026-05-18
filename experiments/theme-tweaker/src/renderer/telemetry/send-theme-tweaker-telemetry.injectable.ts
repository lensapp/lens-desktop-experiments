import { getInjectable } from "@lensapp/injectable";
import { sendTelemetryEventInjectionToken } from "@lensapp/telemetry";
import { deferAwait } from "@lensapp/utilities";
import type { ThemeTweakerTelemetryEvent } from "./theme-tweaker-telemetry-event";

const experimentTelemetryName = "theme-tweaker";

export type SendThemeTweakerTelemetry = (event: ThemeTweakerTelemetryEvent) => void;

const sendThemeTweakerTelemetryInjectable = getInjectable({
  id: "theme-tweaker-send-telemetry",

  instantiate: (di): SendThemeTweakerTelemetry => {
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

export default sendThemeTweakerTelemetryInjectable;
