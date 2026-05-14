import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { getInjectable, lifecycleEnum } from "@lensapp/injectable";
import { aiModelConfigurationInjectionToken, aiProfileInjectionToken } from "@lensapp/ai-engine-contracts";
import { contextWindowSizeFieldBunch } from "../ai-provider-instance/field-bunches/context-window-size-field-bunch.injectable";
import { maxOutputTokensFieldBunch } from "../ai-provider-instance/field-bunches/max-output-tokens-field-bunch.injectable";
import { assertDefined } from "@lensapp/utilities";

const parseOptionalNumber = (raw: unknown): number | undefined => {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const text = String(raw).trim();
  if (text === "") {
    return undefined;
  }
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const aiModelConfigurationInjectable = getInjectable({
  id: "ai-model-configuration-for-azure-2",

  instantiate: async (di, profileId) => {
    const aiProfile = di.inject(aiProfileInjectionToken, profileId).get();

    assertDefined(aiProfile);

    const contextWindowSize = await di.inject(
      contextWindowSizeFieldBunch.outboundValue,
      aiProfile.aiProviderInstanceId,
    );
    const maxOutputTokens = await di.inject(maxOutputTokensFieldBunch.outboundValue, aiProfile.aiProviderInstanceId);

    const parsedMaxOutputTokens = parseOptionalNumber(maxOutputTokens?.get());
    const parsedContextWindow = parseOptionalNumber(contextWindowSize?.get());

    return {
      maxOutputTokens: parsedMaxOutputTokens as unknown as number,
      maxContextWindowTokens: parsedContextWindow ?? 0,
      temperature: 0.00001,
    };
  },

  injectionToken: aiModelConfigurationInjectionToken.for(azure2Specifier),
  lifecycle: lifecycleEnum.transient,
});
