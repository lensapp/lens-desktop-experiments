import { getInjectable } from "@lensapp/injectable";
import { computed } from "mobx";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { asReactive } from "@lensapp/utilities";
import { type AiProfile, aiProfileProviderInjectionToken } from "@lensapp/ai-engine-contracts";
import { azure2ProviderIdsStateInjectable } from "../ai-provider-instance/provider-ids.injectable";
import { modelIdsFieldBunch } from "../ai-provider-instance/field-bunches/model-ids-field-bunch.injectable";
import { trim } from "lodash/fp";

export const aiProfilesInjectable = getInjectable({
  id: "ai-profiles-for-azure-2",

  instantiate: (di) => {
    const providerIdsReactive = asReactive(di.inject(azure2ProviderIdsStateInjectable));

    return computed(() => {
      const providerIds = providerIdsReactive.get();

      if (!providerIds) {
        return [];
      }

      return [...providerIds].flatMap((aiProviderInstanceId) => {
        const modelIdsReactive = asReactive(di.inject(modelIdsFieldBunch.state, aiProviderInstanceId));
        const modelIdsState = modelIdsReactive.get();
        const aiModelIdsString = modelIdsState?.get() ?? "";

        return aiModelIdsString
          .split(",")
          .map(trim)
          .filter((aiModelId) => aiModelId !== "")
          .map(
            (aiModelId): AiProfile => ({
              id: `${aiProviderInstanceId}:${aiModelId}`,
              name: aiModelId,
              aiProviderInstanceId,
              aiModelId,
              aiProviderKind: azure2Specifier,
            }),
          );
      });
    });
  },

  injectionToken: aiProfileProviderInjectionToken,
});
