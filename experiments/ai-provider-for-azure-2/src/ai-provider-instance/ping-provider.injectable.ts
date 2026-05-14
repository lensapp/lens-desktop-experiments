import { getInjectable } from "@lensapp/injectable";
import { pingAiProviderForKindInjectionToken } from "@lensapp/ai-provider-instance-contracts";
import { pingAiModelInjectionToken, aiFetchForInjectionToken } from "@lensapp/ai-engine-contracts";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { createAzureInjectable } from "../ai-model/ai-model.injectable";
import { apiKeyFieldBunch } from "./field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "./field-bunches/resource-name-field-bunch.injectable";
import { apiVersionFieldBunch } from "./field-bunches/api-version-field-bunch.injectable";
import { modelIdsFieldBunch } from "./field-bunches/model-ids-field-bunch.injectable";
import { forceReasoningTranslationFieldBunch } from "./field-bunches/force-reasoning-translation-field-bunch.injectable";
import { getRetryingFetch } from "../ai-model/_private/retrying-fetch";

export const pingAzure2ProviderInjectable = getInjectable({
  id: "ping-azure-2-provider",

  instantiate: (di) => {
    const createAzure = di.inject(createAzureInjectable);
    const pingAiModel = di.inject(pingAiModelInjectionToken);
    const aiFetchFor = di.inject(aiFetchForInjectionToken);
    const apiKeyFormValue = di.inject(apiKeyFieldBunch.formValue);
    const resourceNameFormValue = di.inject(resourceNameFieldBunch.formValue);
    const apiVersionFormValue = di.inject(apiVersionFieldBunch.formValue);
    const modelIdsFormValue = di.inject(modelIdsFieldBunch.formValue);
    const forceReasoningFormValue = di.inject(forceReasoningTranslationFieldBunch.formValue);

    return async () => {
      const modelId = (modelIdsFormValue.get() ?? "")
        .split(",")
        .map((s) => s.trim())
        .find((s) => s !== "");

      if (!modelId) {
        throw new Error("Please enter at least one model ID before testing the connection");
      }

      const upstreamFetch = aiFetchFor("ping") as unknown as typeof fetch;
      const retryingFetch = getRetryingFetch({
        upstreamFetch,
        forceMaxCompletionTokens: forceReasoningFormValue.get() === "true",
      });
      const provider = createAzure({
        resourceName: resourceNameFormValue.get() ?? "",
        apiKey: apiKeyFormValue.get() ?? "",
        apiVersion: apiVersionFormValue.get(),
        fetch: retryingFetch,
      });
      const model = provider(modelId);

      await pingAiModel(model);
    };
  },

  injectionToken: pingAiProviderForKindInjectionToken.for(azure2Specifier),
});
