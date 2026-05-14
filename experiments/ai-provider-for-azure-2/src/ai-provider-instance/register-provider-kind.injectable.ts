import { getInjectable } from "@lensapp/injectable";
import { aiProviderKindInjectionToken } from "@lensapp/ai-engine-contracts";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";

export const registerAzure2ProviderKindInjectable = getInjectable({
  id: "register-azure-2-provider-kind",
  instantiate: () => azure2Specifier,
  injectionToken: aiProviderKindInjectionToken,
});
