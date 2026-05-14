import { getInjectable } from "@lensapp/injectable";
import { type AiProfileId, aiProfileValidatorInjectionToken } from "@lensapp/ai-engine-contracts";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { asReactive, getKeyedSingletonLifecycle } from "@lensapp/utilities";
import { computed } from "mobx";
import { apiKeyFieldBunch } from "../ai-provider-instance/field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "../ai-provider-instance/field-bunches/resource-name-field-bunch.injectable";
import { modelIdsFieldBunch } from "../ai-provider-instance/field-bunches/model-ids-field-bunch.injectable";
import { apiVersionFieldBunch } from "../ai-provider-instance/field-bunches/api-version-field-bunch.injectable";
import { aiProfilesInjectable } from "../ai-profile-provider/ai-profiles.injectable";

export const aiProfileValidatorInjectable = getInjectable({
  id: "ai-profile-validator-for-azure-2",

  instantiate: (di, aiProfileId) => {
    const azure2Profiles = di.inject(aiProfilesInjectable);
    const getApiKeyValidity = di.inject(apiKeyFieldBunch.validity);
    const getResourceNameValidity = di.inject(resourceNameFieldBunch.validity);
    const getModelIdsValidity = di.inject(modelIdsFieldBunch.validity);
    const getApiVersionValidity = di.inject(apiVersionFieldBunch.validity);

    return computed(() => {
      const aiProfile = azure2Profiles.get().find((p) => p.id === aiProfileId);

      if (!aiProfile) {
        return false;
      }

      const apiKeyReactive = asReactive(di.inject(apiKeyFieldBunch.state, aiProfile.aiProviderInstanceId));
      const apiKeyState = apiKeyReactive.get();

      if (!apiKeyState) {
        return false;
      }

      const resourceNameReactive = asReactive(di.inject(resourceNameFieldBunch.state, aiProfile.aiProviderInstanceId));
      const resourceNameState = resourceNameReactive.get();

      if (!resourceNameState) {
        return false;
      }

      const modelIdsReactive = asReactive(di.inject(modelIdsFieldBunch.state, aiProfile.aiProviderInstanceId));
      const modelIdsState = modelIdsReactive.get();

      if (!modelIdsState) {
        return false;
      }

      const apiVersionReactive = asReactive(di.inject(apiVersionFieldBunch.state, aiProfile.aiProviderInstanceId));
      const apiVersionState = apiVersionReactive.get();

      if (!apiVersionState) {
        return false;
      }

      const apiKeyValidity = getApiKeyValidity(apiKeyState.get());
      const resourceNameValidity = getResourceNameValidity(resourceNameState.get());
      const modelIdsValidity = getModelIdsValidity(modelIdsState.get());
      const apiVersionValidity = getApiVersionValidity(apiVersionState.get());

      return (
        apiKeyValidity.isValid && resourceNameValidity.isValid && modelIdsValidity.isValid && apiVersionValidity.isValid
      );
    });
  },

  injectionToken: aiProfileValidatorInjectionToken.for(azure2Specifier),
  lifecycle: getKeyedSingletonLifecycle<AiProfileId>(),
});
