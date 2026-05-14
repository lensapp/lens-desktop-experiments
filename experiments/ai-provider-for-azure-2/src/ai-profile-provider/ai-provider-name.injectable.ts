import { getInjectable } from "@lensapp/injectable";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { asReactive } from "@lensapp/utilities";
import { azure2ProviderNameStateInjectable } from "../ai-provider-instance/provider-name-state.injectable";
import { type AiProfileId, aiProfileInjectionToken } from "@lensapp/ai-engine-contracts";
import { aiProfileGroupNameInjectionToken } from "@lensapp/ai-chat-contracts";

export const aiProfileGroupNameForAzure2Injectable = getInjectable({
  id: "ai-profile-group-name-for-azure-2",

  instantiate: (di) => {
    return (profileId: AiProfileId) => {
      const aiProfile = di.inject(aiProfileInjectionToken, profileId).get();

      if (!aiProfile) {
        return "Azure (Lab) - Unknown";
      }

      const nameReactive = asReactive(di.inject(azure2ProviderNameStateInjectable, aiProfile.aiProviderInstanceId));
      const nameState = nameReactive.get();

      return `Azure (Lab) - ${nameState?.get() ?? "Unknown"}`;
    };
  },

  injectionToken: aiProfileGroupNameInjectionToken.for(azure2Specifier),
});
