import { aiProviderNameInjectionToken } from "@lensapp/ai-chat-contracts";
import { getInjectable } from "@lensapp/injectable";
import { azure2Specifier } from "./ai-provider.injectable";

export const aiProviderNameForAzure2Injectable = getInjectable({
  id: "ai-provider-name-for-azure-2",

  instantiate: () => "Azure (Lab)",

  injectionToken: aiProviderNameInjectionToken.for(azure2Specifier),
});
