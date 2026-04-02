import { getInjectable } from "@lensapp/injectable";
import { devToolInjectionToken } from "../../in-general/dev-tool";
import { LivingDocs } from "./_private/living-docs.injectable";

export const livingDocsDevToolId = "living-docs-dev-tool";

export const livingDocsDevToolInjectable = getInjectable({
  id: "living-docs-dev-tool",

  instantiate: () => ({
    id: livingDocsDevToolId,
    Component: LivingDocs,
  }),

  injectionToken: devToolInjectionToken,
});
