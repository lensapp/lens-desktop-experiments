import { Span } from "@lensapp/element-components";
import type { AiProviderInstanceFieldBunchComponentProps } from "@lensapp/ai-provider-instance-contracts";
import { observer } from "mobx-react";
import type { Azure2ProviderInstance } from "../../../ai-provider/ai-provider.injectable";

type Props = AiProviderInstanceFieldBunchComponentProps<Azure2ProviderInstance, string | undefined>;

export const CheckboxInput = observer(({ value, setValue, fieldDef, isEnvConfigured }: Props) => {
  const currentValue = value.get();
  const envConfigured = isEnvConfigured.get();
  const checked = currentValue === "true";

  return (
    <section>
      <label
        htmlFor={`${fieldDef.id}-input`}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: envConfigured ? "default" : "pointer" }}
      >
        <input
          data-testid={`${fieldDef.id}-input`}
          id={`${fieldDef.id}-input`}
          type="checkbox"
          checked={checked}
          disabled={envConfigured}
          onChange={(e) => setValue((e.target.checked ? "true" : "") as unknown as never)}
        />
        <span style={{ fontWeight: 600 }}>{fieldDef.label}</span>
      </label>
      {fieldDef.hint && (
        <Span $flex={{ direction: "vertical", gap: "xs" }}>
          <Span className="hint">{fieldDef.hint}</Span>
        </Span>
      )}
    </section>
  );
});
