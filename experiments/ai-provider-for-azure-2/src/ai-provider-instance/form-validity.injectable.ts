import { getInjectable } from "@lensapp/injectable";
import { computed } from "mobx";
import {
  aiProviderInstanceFormValidityInjectionToken,
  aggregateAiProviderInstanceFieldValidities,
} from "@lensapp/ai-provider-instances";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { apiKeyFieldBunch } from "./field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "./field-bunches/resource-name-field-bunch.injectable";
import { modelIdsFieldBunch } from "./field-bunches/model-ids-field-bunch.injectable";
import { apiVersionFieldBunch } from "./field-bunches/api-version-field-bunch.injectable";
import { contextWindowSizeFieldBunch } from "./field-bunches/context-window-size-field-bunch.injectable";
import { maxOutputTokensFieldBunch } from "./field-bunches/max-output-tokens-field-bunch.injectable";
import { customSystemPromptFieldBunch } from "./field-bunches/custom-system-prompt-field-bunch.injectable";

export const azure2FormValidityInjectable = getInjectable({
  id: "azure-2-form-validity",

  instantiate: (di) => {
    const getApiKeyValidity = di.inject(apiKeyFieldBunch.validity);
    const getResourceNameValidity = di.inject(resourceNameFieldBunch.validity);
    const getModelIdsValidity = di.inject(modelIdsFieldBunch.validity);
    const getApiVersionValidity = di.inject(apiVersionFieldBunch.validity);
    const getContextWindowSizeValidity = di.inject(contextWindowSizeFieldBunch.validity);
    const getMaxOutputTokensValidity = di.inject(maxOutputTokensFieldBunch.validity);
    const getCustomSystemPromptValidity = di.inject(customSystemPromptFieldBunch.validity);

    const apiKeyFormValue = di.inject(apiKeyFieldBunch.formValue);
    const resourceNameFormValue = di.inject(resourceNameFieldBunch.formValue);
    const modelIdsFormValue = di.inject(modelIdsFieldBunch.formValue);
    const apiVersionFormValue = di.inject(apiVersionFieldBunch.formValue);
    const contextWindowSizeFormValue = di.inject(contextWindowSizeFieldBunch.formValue);
    const maxOutputTokensFormValue = di.inject(maxOutputTokensFieldBunch.formValue);
    const customSystemPromptFormValue = di.inject(customSystemPromptFieldBunch.formValue);

    return computed(() => {
      const maxOutputTokensRaw = maxOutputTokensFormValue.get();
      const maxOutputTokensForValidity =
        maxOutputTokensRaw === undefined || String(maxOutputTokensRaw).trim() === ""
          ? (undefined as unknown as number)
          : Number(maxOutputTokensRaw);

      return aggregateAiProviderInstanceFieldValidities({
        apiKey: getApiKeyValidity(apiKeyFormValue.get()),
        resourceName: getResourceNameValidity(resourceNameFormValue.get()),
        modelIds: getModelIdsValidity(modelIdsFormValue.get()),
        apiVersion: getApiVersionValidity(apiVersionFormValue.get()),
        contextWindowSize: getContextWindowSizeValidity(Number(contextWindowSizeFormValue.get())),
        maxOutputTokens: getMaxOutputTokensValidity(maxOutputTokensForValidity),
        customSystemPrompt: getCustomSystemPromptValidity(customSystemPromptFormValue.get()),
      });
    });
  },

  injectionToken: aiProviderInstanceFormValidityInjectionToken.for(azure2Specifier),
});
