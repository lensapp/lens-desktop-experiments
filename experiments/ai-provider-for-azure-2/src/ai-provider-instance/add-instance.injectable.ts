import { getInjectable } from "@lensapp/injectable";
import { runInAction } from "mobx";
import { addAiProviderInstanceForKindInjectionToken } from "@lensapp/ai-provider-instance-contracts";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { azure2ProviderIdsPersistedInjectable } from "./provider-ids.injectable";
import { azure2ProviderNamePersistedInjectable } from "./provider-name-state.injectable";
import { apiKeyFieldBunch } from "./field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "./field-bunches/resource-name-field-bunch.injectable";
import { modelIdsFieldBunch } from "./field-bunches/model-ids-field-bunch.injectable";
import { apiVersionFieldBunch } from "./field-bunches/api-version-field-bunch.injectable";
import { contextWindowSizeFieldBunch } from "./field-bunches/context-window-size-field-bunch.injectable";
import { maxOutputTokensFieldBunch } from "./field-bunches/max-output-tokens-field-bunch.injectable";
import { customSystemPromptFieldBunch } from "./field-bunches/custom-system-prompt-field-bunch.injectable";
import { forceReasoningTranslationFieldBunch } from "./field-bunches/force-reasoning-translation-field-bunch.injectable";

export const addAzure2ProviderInstanceInjectable = getInjectable({
  id: "add-azure-2-provider-instance",

  instantiate: async (di) => {
    const providerIds = await di.inject(azure2ProviderIdsPersistedInjectable).promise();

    const apiKeyFormValue = di.inject(apiKeyFieldBunch.formValue);
    const resourceNameFormValue = di.inject(resourceNameFieldBunch.formValue);
    const modelIdsFormValue = di.inject(modelIdsFieldBunch.formValue);
    const apiVersionFormValue = di.inject(apiVersionFieldBunch.formValue);
    const contextWindowSizeFormValue = di.inject(contextWindowSizeFieldBunch.formValue);
    const maxOutputTokensFormValue = di.inject(maxOutputTokensFieldBunch.formValue);
    const customSystemPromptFormValue = di.inject(customSystemPromptFieldBunch.formValue);
    const forceReasoningFormValue = di.inject(forceReasoningTranslationFieldBunch.formValue);

    return async (name: string) => {
      const aiProviderInstanceId = crypto.randomUUID();

      const [
        nameState,
        apiKeyState,
        resourceNameState,
        modelIdsState,
        apiVersionState,
        contextWindowSizeState,
        maxOutputTokensState,
        customSystemPromptState,
        forceReasoningState,
      ] = await Promise.all([
        di.inject(azure2ProviderNamePersistedInjectable, aiProviderInstanceId).promise(),
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
        providerIds.push(aiProviderInstanceId);
        nameState.set(name);
        apiKeyState.set(apiKeyFormValue.get());
        resourceNameState.set(resourceNameFormValue.get());
        modelIdsState.set(modelIdsFormValue.get());
        apiVersionState.set(apiVersionFormValue.get());
        contextWindowSizeState.set(contextWindowSizeFormValue.get());
        maxOutputTokensState.set(maxOutputTokensFormValue.get());
        customSystemPromptState.set(customSystemPromptFormValue.get());
        forceReasoningState.set(forceReasoningFormValue.get());
      });
    };
  },

  injectionToken: addAiProviderInstanceForKindInjectionToken.for(azure2Specifier),
});
