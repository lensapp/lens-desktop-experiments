import { getInjectable } from "@lensapp/injectable";
import { statusBarItemInjectionToken } from "@lensapp/status-bar";

const HelloStatusBarItem = () => (
  <div style={{ padding: "0 8px", color: "#4caf50", fontWeight: "bold" }}>Lab Experiments Enabled</div>
);

const helloStatusBarItemInjectable = getInjectable({
  id: "hello-world-status-bar-item",

  instantiate: () => ({
    Component: HelloStatusBarItem,
    position: "right" as const,
  }),

  injectionToken: statusBarItemInjectionToken,
});

export default helloStatusBarItemInjectable;
