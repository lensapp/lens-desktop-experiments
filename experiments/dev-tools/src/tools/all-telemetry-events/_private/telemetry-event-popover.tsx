import { Div } from "@lensapp/element-components";
import type { TelemetryEvent } from "@lensapp/telemetry";

export const TelemetryEventPopover = ({ event }: { event: TelemetryEvent }) => (
  <Div
    $backgroundColor="backgroundPrimary"
    $border={{ width: true, color: "borderPrimary", radius: "l" }}
    $padding="xs"
    $style={{ maxWidth: "650px" }}
    $overflow={{ x: "auto" }}
  >
    <Div>Name: {event.name}</Div>
    <Div>Action: {event.action}</Div>
    <Div>User Interaction: {event.userInteraction ? "true" : "false"}</Div>
    <Div>
      Parameters:
      <pre>{JSON.stringify(event.params, null, 2)}</pre>
    </Div>
  </Div>
);
