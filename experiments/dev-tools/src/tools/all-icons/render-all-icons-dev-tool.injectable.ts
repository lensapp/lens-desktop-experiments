import { getInjectable } from "@lensapp/injectable";
import { devToolInjectionToken } from "../../in-general/dev-tool";
import { AllIcons } from "./render-all-icons.injectable";

export const renderAllIconsDevToolInjectable = getInjectable({
  id: "render-all-icons-dev-tool",

  instantiate: () => ({
    id: "all-icons",
    Component: AllIcons,
  }),

  injectionToken: devToolInjectionToken,
});
