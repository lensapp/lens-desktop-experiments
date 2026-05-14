import { getInjectableComponent } from "@lensapp/injectable-react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import { aiProviderInstanceFormInjectionToken, PingButton } from "@lensapp/ai-provider-instances";
import { Div } from "@lensapp/element-components";
import { azure2Specifier } from "../ai-provider/ai-provider.injectable";
import { apiKeyFieldBunch } from "./field-bunches/api-key-field-bunch.injectable";
import { resourceNameFieldBunch } from "./field-bunches/resource-name-field-bunch.injectable";
import { modelIdsFieldBunch } from "./field-bunches/model-ids-field-bunch.injectable";
import { apiVersionFieldBunch } from "./field-bunches/api-version-field-bunch.injectable";
import { contextWindowSizeFieldBunch } from "./field-bunches/context-window-size-field-bunch.injectable";
import { maxOutputTokensFieldBunch } from "./field-bunches/max-output-tokens-field-bunch.injectable";
import { customSystemPromptFieldBunch } from "./field-bunches/custom-system-prompt-field-bunch.injectable";
import { forceReasoningTranslationFieldBunch } from "./field-bunches/force-reasoning-translation-field-bunch.injectable";

export const AiProviderInstanceFormFieldsForAzure2 = getInjectableComponent({
  id: "instance-form-fields-for-azure-2",

  Component: observer(() => {
    const ApiKeyField = useSyncInject(apiKeyFieldBunch.Component);
    const ResourceNameField = useSyncInject(resourceNameFieldBunch.Component);
    const ModelIdsField = useSyncInject(modelIdsFieldBunch.Component);
    const ApiVersionField = useSyncInject(apiVersionFieldBunch.Component);
    const ContextWindowSizeField = useSyncInject(contextWindowSizeFieldBunch.Component);
    const MaxOutputTokensField = useSyncInject(maxOutputTokensFieldBunch.Component);
    const ForceReasoningField = useSyncInject(forceReasoningTranslationFieldBunch.Component);
    const CustomSystemPromptField = useSyncInject(customSystemPromptFieldBunch.Component);

    return (
      <Div $flex={{ direction: "vertical", gap: "5xl" }}>
        <ApiKeyField />
        <ResourceNameField />
        <ModelIdsField />
        <ApiVersionField />
        <ContextWindowSizeField />
        <MaxOutputTokensField />
        <ForceReasoningField />
        <PingButton aiProviderKind={azure2Specifier} />
        <CustomSystemPromptField />
      </Div>
    );
  }),

  injectionToken: aiProviderInstanceFormInjectionToken.for(azure2Specifier),
});
