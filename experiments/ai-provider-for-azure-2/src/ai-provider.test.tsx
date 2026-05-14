import { createContainer, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";

import { aiProviderInjectable, azure2Specifier } from "./ai-provider/ai-provider.injectable";

import {
  aiModelConfigurationInjectionToken,
  aiModelInjectionToken,
  aiProfileInjectionToken,
  aiProfilesInjectionToken,
  aiProviderInjectionToken,
  type AiModel,
  type AiProfile,
} from "@lensapp/ai-engine-contracts";

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { autorun, computed, observable, type IObservableArray } from "mobx";
import { aiProviderForAzure2Feature } from "./feature";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";
import { createAzureInjectable } from "./ai-model/ai-model.injectable";
import { azure2ProviderIdsStateInjectable } from "./ai-provider-instance/provider-ids.injectable";
import { apiKeyFieldBunch } from "./ai-provider-instance/field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "./ai-provider-instance/field-bunches/resource-name-field-bunch.injectable";
import { modelIdsFieldBunch } from "./ai-provider-instance/field-bunches/model-ids-field-bunch.injectable";
import { apiVersionFieldBunch } from "./ai-provider-instance/field-bunches/api-version-field-bunch.injectable";
import { contextWindowSizeFieldBunch } from "./ai-provider-instance/field-bunches/context-window-size-field-bunch.injectable";
import { maxOutputTokensFieldBunch } from "./ai-provider-instance/field-bunches/max-output-tokens-field-bunch.injectable";

describe("ai-provider-for-azure-2", () => {
  let di: DiContainer;

  beforeEach(async () => {
    di = createContainer("irrelevant");
    registerFeature(di, aiProviderForAzure2Feature);
    runAllTestUtilityRunnables(di);
  });

  it("is an AI provider", () => {
    expect(aiProviderInjectable.injectionToken).toBe(aiProviderInjectionToken);
  });

  it("has the azure-2 kind and a higher priority than the original azure provider", () => {
    const aiProvider = di.inject(aiProviderInjectable);

    expect(aiProvider).toEqual({
      kind: azure2Specifier,
      priority: 4,
    });
  });

  describe("given azure-2 provider instance has been configured", () => {
    const testAiProviderInstanceId = "test-instance-id";
    let resolveProviderIds: AsyncFnMock<() => Promise<IObservableArray<string>>>;

    beforeEach(async () => {
      resolveProviderIds = asyncFn();

      di.override(azure2ProviderIdsStateInjectable, () => resolveProviderIds());

      di.override(apiKeyFieldBunch.state, () => Promise.resolve(observable.box("some-api-key")));
      di.override(resourceNameFieldBunch.state, () => Promise.resolve(observable.box("some-resource-name")));
      di.override(modelIdsFieldBunch.state, () =>
        Promise.resolve(observable.box("   some-model-1 ,,    some-model-2  ")),
      );
      di.override(apiVersionFieldBunch.state, () => Promise.resolve(observable.box("some-api-version")));
      di.override(contextWindowSizeFieldBunch.state, () => Promise.resolve(observable.box("128000")));
      di.override(maxOutputTokensFieldBunch.state, () => Promise.resolve(observable.box("")));

      di.override(aiProfileInjectionToken, (_di, profileId) =>
        computed(() => ({
          id: profileId,
          name: "irrelevant",
          aiProviderInstanceId: testAiProviderInstanceId,
          aiModelId: profileId.split(":").slice(1).join(":"),
          aiProviderKind: azure2Specifier,
        })),
      );
    });

    describe("when observing all AI-profiles", () => {
      let actualObservedProfiles: AiProfile[];

      beforeEach(async () => {
        const aiProfiles = di.inject(aiProfilesInjectionToken);

        autorun(() => {
          actualObservedProfiles = aiProfiles.get();
        });

        await resolveProviderIds.resolve(observable.array([testAiProviderInstanceId]));
      });

      it("emits one profile per configured model id", () => {
        expect(actualObservedProfiles).toEqual([
          {
            id: `${testAiProviderInstanceId}:some-model-1`,
            name: "some-model-1",
            aiProviderInstanceId: testAiProviderInstanceId,
            aiModelId: "some-model-1",
            aiProviderKind: azure2Specifier,
          },
          {
            id: `${testAiProviderInstanceId}:some-model-2`,
            name: "some-model-2",
            aiProviderInstanceId: testAiProviderInstanceId,
            aiModelId: "some-model-2",
            aiProviderKind: azure2Specifier,
          },
        ]);
      });

      it("AI model configuration with blank max output tokens returns undefined (not 0) so the field is omitted from the request", async () => {
        const actualConfiguration = await di.inject(
          aiModelConfigurationInjectionToken.for(azure2Specifier),
          `${testAiProviderInstanceId}:some-model-1`,
        );

        expect(actualConfiguration).toEqual({
          maxContextWindowTokens: 128000,
          maxOutputTokens: undefined,
          temperature: 0.00001,
        });
      });

      describe("given injecting AI-model related to one of the profiles", () => {
        let actualModel: AiModel;
        let createAzureMock: jest.Mock;
        let createAzureForMock: () => jest.Mock;

        beforeEach(async () => {
          createAzureMock = jest.fn(() => "some-vercel-model");
          createAzureForMock = jest.fn(() => createAzureMock);

          di.override(createAzureInjectable, () => createAzureForMock as any);

          const createModelFor = di.inject(aiModelInjectionToken.for(azure2Specifier));
          const profileId = `${testAiProviderInstanceId}:some-model-2`;
          const createModel = await createModelFor({ fetch: someFetch, profileId });

          actualModel = createModel("some-model-2");
        });

        it("creates the provider with the configured credentials and a wrapped fetch", () => {
          expect(createAzureForMock).toHaveBeenCalledWith({
            apiKey: "some-api-key",
            apiVersion: "some-api-version",
            resourceName: "some-resource-name",
            fetch: expect.any(Function),
          });
        });

        it("creates the model using the configured model name", () => {
          expect(createAzureMock).toHaveBeenCalledWith("some-model-2");
        });

        it("returns the created vercel AI model", () => {
          expect(actualModel).toBe("some-vercel-model");
        });
      });
    });
  });

  describe("given no provider instances exist", () => {
    let resolveProviderIds: AsyncFnMock<() => Promise<IObservableArray<string>>>;

    beforeEach(async () => {
      resolveProviderIds = asyncFn();
      di.override(azure2ProviderIdsStateInjectable, () => resolveProviderIds());
    });

    describe("when observing all AI-profiles", () => {
      let actualObservedProfiles: AiProfile[];

      beforeEach(async () => {
        const aiProfiles = di.inject(aiProfilesInjectionToken);

        autorun(() => {
          actualObservedProfiles = aiProfiles.get();
        });

        await resolveProviderIds.resolve(observable.array([]));
      });

      it("no profiles get observed", () => {
        expect(actualObservedProfiles).toEqual([]);
      });
    });
  });
});

const someFetch: any = () => {};
