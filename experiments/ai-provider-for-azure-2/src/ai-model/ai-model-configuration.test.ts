import { createContainer, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";
import { aiProfileInjectionToken } from "@lensapp/ai-engine-contracts";
import { computed } from "mobx";

import { aiProviderForAzure2Feature } from "../feature";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { aiModelConfigurationInjectable } from "./ai-model-configuration.injectable";
import { contextWindowSizeFieldBunch } from "../ai-provider-instance/field-bunches/context-window-size-field-bunch.injectable";
import { maxOutputTokensFieldBunch } from "../ai-provider-instance/field-bunches/max-output-tokens-field-bunch.injectable";

describe("ai-model-configuration for azure-2", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");
    registerFeature(di, aiProviderForAzure2Feature);
    runAllTestUtilityRunnables(di);

    di.override(aiProfileInjectionToken, (_di, profileId) =>
      computed(() => ({
        id: profileId,
        name: "irrelevant",
        aiProviderInstanceId: "some-instance-id",
        aiModelId: "some-model",
        aiProviderKind: azure2Specifier,
      })),
    );
  });

  describe("when max output tokens is set to a number string", () => {
    beforeEach(() => {
      di.override(maxOutputTokensFieldBunch.outboundValue, () => Promise.resolve(computed(() => 88888)));
    });

    it("returns that number as maxOutputTokens", async () => {
      const config = await di.inject(aiModelConfigurationInjectable, "some-instance-id:some-model");
      expect(config.maxOutputTokens).toBe(88888);
    });
  });

  describe("when max output tokens is blank (empty string)", () => {
    beforeEach(() => {
      di.override(maxOutputTokensFieldBunch.outboundValue, () => Promise.resolve(computed(() => "" as unknown as number)));
    });

    it("returns undefined as maxOutputTokens so streamText omits the field", async () => {
      const config = await di.inject(aiModelConfigurationInjectable, "some-instance-id:some-model");
      expect(config.maxOutputTokens).toBeUndefined();
    });
  });

  describe("when max output tokens is undefined (never set)", () => {
    beforeEach(() => {
      di.override(maxOutputTokensFieldBunch.outboundValue, () => Promise.resolve(computed(() => undefined)));
    });

    it("returns undefined as maxOutputTokens", async () => {
      const config = await di.inject(aiModelConfigurationInjectable, "some-instance-id:some-model");
      expect(config.maxOutputTokens).toBeUndefined();
    });
  });

  describe("when context window size is set", () => {
    beforeEach(() => {
      di.override(contextWindowSizeFieldBunch.outboundValue, () => Promise.resolve(computed(() => 99999)));
    });

    it("returns that number as maxContextWindowTokens", async () => {
      const config = await di.inject(aiModelConfigurationInjectable, "some-instance-id:some-model");
      expect(config.maxContextWindowTokens).toBe(99999);
    });
  });

  describe("when context window size is blank", () => {
    beforeEach(() => {
      di.override(contextWindowSizeFieldBunch.outboundValue, () => Promise.resolve(computed(() => "" as unknown as number)));
    });

    it("returns 0 as maxContextWindowTokens (preserves prior default behavior)", async () => {
      const config = await di.inject(aiModelConfigurationInjectable, "some-instance-id:some-model");
      expect(config.maxContextWindowTokens).toBe(0);
    });
  });
});
