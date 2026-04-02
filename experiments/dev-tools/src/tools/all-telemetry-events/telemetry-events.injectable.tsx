import { Button, Div } from "@lensapp/element-components";
import { getInjectableComponent } from "@lensapp/injectable-react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import { TelemetryEventPopover } from "./_private/telemetry-event-popover";
import { telemetryEventsInjectable } from "./_shared/telemetry-events.injectable";

export const TelemetryEvents = getInjectableComponent({
  id: "telemetry-events-component",

  Component: observer(() => {
    const telemetryEvents = useSyncInject(telemetryEventsInjectable);

    return (
      <Div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}
        $backgroundColor="backgroundSecondary"
        $border={{ width: true, color: "borderPrimary", radius: "l" }}
        $overflow={{ x: "auto" }}
        $padding="xs"
      >
        <Div $flex={{ direction: "horizontal", gap: "xs", verticalAlign: "center" }}>
          {[...telemetryEvents].reverse().map((event, i) => (
            <Button
              key={i}
              $backgroundColor="backgroundPrimary"
              $padding={{ horizontal: "xs" }}
              $border={{ width: true, color: "borderPrimary", radius: "l" }}
              $popover={() => <TelemetryEventPopover {...{ event }} />}
              $style={{ flexShrink: 0 }}
              data-telemetry-event-test={`${event.name}/${event.action}`}
            >
              ({telemetryEvents.size - i}) {event.name} / {event.action}
            </Button>
          ))}
        </Div>
      </Div>
    );
  }),
});
