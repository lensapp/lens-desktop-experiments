import { createContainer, type DiContainer } from "@lensapp/injectable";
import { telemetryDevToolFeature } from "./feature";
import { registerFeature } from "@lensapp/feature-core";
import { devToolInjectionToken } from "../../in-general/dev-tool";
import type { RenderResult } from "@testing-library/react";
import { type Discover, discoverFor } from "@lensapp/react-testing-library-discovery";
import { renderFor } from "@lensapp/rendering-test-utils";
import { telemetryEventsDevToolId, telemetryEventsDevToolInjectable } from "./telemetry-events-dev-tool.injectable";
import type { TelemetryEvent } from "@lensapp/telemetry";
import { gatherTelemetryEventsInjectable } from "./gathering-telemetry-events/gather-telemetry-events.injectable";
import { act } from "react";
import { clearTelemetryEventsInjectable } from "./clear-telemetry-events/clear-telemetry-events.injectable";
import { devToolActionInjectionToken } from "../../in-general/dev-tool-action";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";

describe("telemetry-events-dev-tool", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, telemetryDevToolFeature);

    runAllTestUtilityRunnables(di);
  });

  it("is dev tool", () => {
    expect(telemetryEventsDevToolInjectable.injectionToken).toBe(devToolInjectionToken);
  });

  describe("when rendered", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      const render = renderFor(di);

      const { Component } = di.inject(telemetryEventsDevToolInjectable);

      rendered = await render(<Component />);

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("no events are rendered", () => {
      expect(discover.queryAllElements("telemetry-event").attributeValues).toEqual([]);
    });

    describe("when telemetry event is sent", () => {
      beforeEach(async () => {
        const sendTelemetryEvent = (event: TelemetryEvent) => {
          const gatherTelemetryEvents = di.inject(gatherTelemetryEventsInjectable);

          gatherTelemetryEvents.handler(event);
        };

        await act(async () => {
          sendTelemetryEvent({
            name: "some-name-1",
            action: "some-action-1",
            userInteraction: true,
            destination: "some-destination",
            params: { some: "parameter", someOther: "parameter" },
          });

          sendTelemetryEvent({
            name: "some-name-2",
            action: "some-action-2",
            userInteraction: false,
          });
        });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("events are rendered", () => {
        expect(discover.queryAllElements("telemetry-event").attributeValues).toEqual([
          "some-name-2/some-action-2",
          "some-name-1/some-action-1",
        ]);
      });

      it("given telemetry event with maximal data, when event is clicked, renders", async () => {
        await discover.getSingleElement("telemetry-event", "some-name-1/some-action-1").click();

        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("given telemetry event with minimal data, when event is clicked, renders", async () => {
        await discover.getSingleElement("telemetry-event", "some-name-2/some-action-2").click();

        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when events are cleared", () => {
        beforeEach(async () => {
          const clearTelemetryEvents = di.inject(clearTelemetryEventsInjectable);

          await act(async () => {
            (await clearTelemetryEvents.action)();
          });
        });

        it("is dev tool action", () => {
          expect(clearTelemetryEventsInjectable.injectionToken).toBe(
            devToolActionInjectionToken.for(telemetryEventsDevToolId),
          );
        });

        it("events are no longer rendered", () => {
          expect(discover.queryAllElements("telemetry-event").attributeValues).toEqual([]);
        });
      });
    });
  });
});
