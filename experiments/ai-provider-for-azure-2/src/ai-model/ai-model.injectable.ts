import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { getInjectable } from "@lensapp/injectable";
import { aiModelInjectionToken, aiProfileInjectionToken } from "@lensapp/ai-engine-contracts";
import { createAzure } from "@ai-sdk/azure";
import { apiKeyFieldBunch } from "../ai-provider-instance/field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "../ai-provider-instance/field-bunches/resource-name-field-bunch.injectable";
import { apiVersionFieldBunch } from "../ai-provider-instance/field-bunches/api-version-field-bunch.injectable";
import { forceReasoningTranslationFieldBunch } from "../ai-provider-instance/field-bunches/force-reasoning-translation-field-bunch.injectable";
import { assertDefined } from "@lensapp/utilities";
import { getRetryingFetch } from "./_private/retrying-fetch";

export const aiModelInjectable = getInjectable({
  id: "ai-model-for-azure-2",

  instantiate: (di) => {
    const createAzureModel = di.inject(createAzureInjectable);

    return async ({ profileId, fetch: hostFetch, ...commonOptions }) => {
      const aiProfile = di.inject(aiProfileInjectionToken, profileId).get();

      assertDefined(aiProfile);

      const apiKey = await di.inject(apiKeyFieldBunch.outboundValue, aiProfile.aiProviderInstanceId);
      const resourceName = await di.inject(resourceNameFieldBunch.outboundValue, aiProfile.aiProviderInstanceId);
      const apiVersion = await di.inject(apiVersionFieldBunch.outboundValue, aiProfile.aiProviderInstanceId);
      const forceReasoning = await di.inject(
        forceReasoningTranslationFieldBunch.outboundValue,
        aiProfile.aiProviderInstanceId,
      );

      const forceMaxCompletionTokens = forceReasoning?.get() === "true";

      const upstreamFetch = (hostFetch ?? globalThis.fetch.bind(globalThis)) as typeof fetch;
      const retryingFetch = getRetryingFetch({
        upstreamFetch,
        forceMaxCompletionTokens,
      });

      return createAzureModel({
        ...commonOptions,
        resourceName: resourceName?.get() ?? "",
        apiKey: apiKey?.get() ?? "",
        apiVersion: apiVersion?.get(),
        fetch: retryingFetch,
      });
    };
  },

  injectionToken: aiModelInjectionToken.for(azure2Specifier),
});

export const createAzureInjectable = getInjectable({
  id: "create-azure-for-azure-2",
  instantiate: (_di) => createAzure,
});
