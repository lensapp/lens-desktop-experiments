import { createContainer, type DiContainer } from "@lensapp/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";
import { pingAiModelInjectionToken, aiFetchForInjectionToken } from "@lensapp/ai-engine-contracts";
import { pingAiProviderForKindInjectionToken } from "@lensapp/ai-provider-instance-contracts";
import asyncFn from "@async-fn/jest";
import { runInAction } from "mobx";

import { aiProviderForAzure2Feature } from "../feature";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { createAzureInjectable } from "../ai-model/ai-model.injectable";
import { apiKeyFieldBunch } from "./field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "./field-bunches/resource-name-field-bunch.injectable";
import { apiVersionFieldBunch } from "./field-bunches/api-version-field-bunch.injectable";
import { modelIdsFieldBunch } from "./field-bunches/model-ids-field-bunch.injectable";

describe("ping azure-2 provider", () => {
  let di: DiContainer;
  let createAzureMock: jest.Mock;
  let pingAiModelMock: ReturnType<typeof asyncFn>;

  beforeEach(() => {
    di = createContainer("irrelevant");
    registerFeature(di, aiProviderForAzure2Feature);
    runAllTestUtilityRunnables(di);

    createAzureMock = jest.fn().mockReturnValue((modelId: string) => `model-${modelId}`);
    di.override(createAzureInjectable, () => createAzureMock);

    pingAiModelMock = asyncFn();
    di.override(pingAiModelInjectionToken, () => pingAiModelMock);
    di.override(aiFetchForInjectionToken, () => () => jest.fn() as any);
  });

  describe("when pinging with all required fields", () => {
    let pingPromise: Promise<void>;

    beforeEach(() => {
      runInAction(() => {
        di.inject(apiKeyFieldBunch.formValue).set("some-api-key");
        di.inject(resourceNameFieldBunch.formValue).set("some-resource");
        di.inject(apiVersionFieldBunch.formValue).set("2024-02-01");
        di.inject(modelIdsFieldBunch.formValue).set("gpt-5.4, gpt-4");
      });

      const [ping] = di.injectMany(pingAiProviderForKindInjectionToken.for(azure2Specifier));
      pingPromise = ping();
    });

    it("creates the provider with form values and a custom fetch wrapper", async () => {
      await pingAiModelMock.resolve();
      await pingPromise;

      expect(createAzureMock).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceName: "some-resource",
          apiKey: "some-api-key",
          apiVersion: "2024-02-01",
          fetch: expect.any(Function),
        }),
      );
    });

    it("uses the first configured model ID", async () => {
      await pingAiModelMock.resolve();
      await pingPromise;

      expect(pingAiModelMock).toHaveBeenCalledWith("model-gpt-5.4");
    });
  });

  it("when model IDs field is empty, throws an error", async () => {
    runInAction(() => {
      di.inject(apiKeyFieldBunch.formValue).set("some-api-key");
      di.inject(resourceNameFieldBunch.formValue).set("some-resource");
      di.inject(apiVersionFieldBunch.formValue).set("2024-02-01");
      di.inject(modelIdsFieldBunch.formValue).set("");
    });

    const [ping] = di.injectMany(pingAiProviderForKindInjectionToken.for(azure2Specifier));

    await expect(ping()).rejects.toThrow("Please enter at least one model ID");
  });
});
