import { getInjectable } from "@lensapp/injectable";
import { runInAction } from "mobx";
import { loadFormValuesForKindInjectionToken } from "@lensapp/ai-provider-instance-contracts";
import type { AiProviderInstanceId } from "@lensapp/ai-provider-instance-contracts";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { apiKeyFieldBunch } from "./field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "./field-bunches/resource-name-field-bunch.injectable";
import { modelIdsFieldBunch } from "./field-bunches/model-ids-field-bunch.injectable";
import { apiVersionFieldBunch } from "./field-bunches/api-version-field-bunch.injectable";
import { contextWindowSizeFieldBunch } from "./field-bunches/context-window-size-field-bunch.injectable";
import { maxOutputTokensFieldBunch } from "./field-bunches/max-output-tokens-field-bunch.injectable";
import { customSystemPromptFieldBunch } from "./field-bunches/custom-system-prompt-field-bunch.injectable";
import { forceReasoningTranslationFieldBunch } from "./field-bunches/force-reasoning-translation-field-bunch.injectable";

export const loadAzure2FormValuesInjectable = getInjectable({
  id: "load-azure-2-form-values",

  instantiate: async (di) => {
    const apiKeyFormValue = di.inject(apiKeyFieldBunch.formValue);
    const resourceNameFormValue = di.inject(resourceNameFieldBunch.formValue);
    const modelIdsFormValue = di.inject(modelIdsFieldBunch.formValue);
    const apiVersionFormValue = di.inject(apiVersionFieldBunch.formValue);
    const contextWindowSizeFormValue = di.inject(contextWindowSizeFieldBunch.formValue);
    const maxOutputTokensFormValue = di.inject(maxOutputTokensFieldBunch.formValue);
    const customSystemPromptFormValue = di.inject(customSystemPromptFieldBunch.formValue);
    const forceReasoningFormValue = di.inject(forceReasoningTranslationFieldBunch.formValue);

    return async (aiProviderInstanceId: AiProviderInstanceId) => {
      const [
        apiKeyState,
        resourceNameState,
        modelIdsState,
        apiVersionState,
        contextWindowSizeState,
        maxOutputTokensState,
        customSystemPromptState,
        forceReasoningState,
      ] = await Promise.all([
        di.inject(apiKeyFieldBunch.persisted, aiProviderInstanceId).promise(),
        di.inject(resourceNameFieldBunch.persisted, aiProviderInstanceId).promise(),
        di.inject(modelIdsFieldBunch.persisted, aiProviderInstanceId).promise(),
        di.inject(apiVersionFieldBunch.persisted, aiProviderInstanceId).promise(),
        di.inject(contextWindowSizeFieldBunch.persisted, aiProviderInstanceId).promise(),
        di.inject(maxOutputTokensFieldBunch.persisted, aiProviderInstanceId).promise(),
        di.inject(customSystemPromptFieldBunch.persisted, aiProviderInstanceId).promise(),
        di.inject(forceReasoningTranslationFieldBunch.persisted, aiProviderInstanceId).promise(),
      ]);

      runInAction(() => {
        apiKeyFormValue.set(apiKeyState.get());
        resourceNameFormValue.set(resourceNameState.get());
        modelIdsFormValue.set(modelIdsState.get());
        apiVersionFormValue.set(apiVersionState.get());
        contextWindowSizeFormValue.set(contextWindowSizeState.get());
        maxOutputTokensFormValue.set(maxOutputTokensState.get());
        customSystemPromptFormValue.set(customSystemPromptState.get());
        forceReasoningFormValue.set(forceReasoningState.get());
      });
    };
  },

  injectionToken: loadFormValuesForKindInjectionToken.for(azure2Specifier),
});
