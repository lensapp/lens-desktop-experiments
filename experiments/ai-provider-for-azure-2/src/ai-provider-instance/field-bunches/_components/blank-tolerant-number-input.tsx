import { Input } from "@lensapp/input";
import { Span } from "@lensapp/element-components";
import type { AiProviderInstanceFieldBunchComponentProps } from "@lensapp/ai-provider-instance-contracts";
import { observer } from "mobx-react";
import type { Azure2ProviderInstance } from "../../../ai-provider/ai-provider.injectable";

type Props = AiProviderInstanceFieldBunchComponentProps<Azure2ProviderInstance, number | undefined> & {
  onBlur?: () => void;
};

export const BlankTolerantNumberInput = observer(
  ({ value, setValue, fieldDef, validity, isEnvConfigured, onBlur }: Props) => {
    const currentValue = value.get();
    const currentValidity = validity.get();
    const envConfigured = isEnvConfigured.get();

    const displayValue = envConfigured
      ? ""
      : currentValue === undefined || currentValue === null || Number.isNaN(currentValue as unknown as number)
        ? ""
        : (currentValue as unknown as number).toString();

    return (
      <section>
        <label htmlFor={`${fieldDef.id}-input`} style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
          {`${fieldDef.label}${fieldDef.required ? " *" : ""}`}
        </label>
        <Input
          data-testid={`${fieldDef.id}-input`}
          id={`${fieldDef.id}-input`}
          type={envConfigured ? "text" : "number"}
          theme="round-black"
          value={displayValue}
          onChange={(v) => {
            const trimmed = (v ?? "").trim();
            if (trimmed === "") {
              setValue("" as unknown as number);
              return;
            }
            const parsed = Number(trimmed);
            if (Number.isFinite(parsed)) {
              setValue(parsed);
            } else {
              setValue("" as unknown as number);
            }
          }}
          onWheel={(e) => (e.target as HTMLElement)?.blur?.()}
          onBlur={onBlur}
          placeholder={envConfigured ? "Configured via environment variable." : fieldDef.placeholder}
          disabled={envConfigured}
          dirty={!currentValidity.isValid && currentValue !== undefined}
        />
        <Span $flex={{ direction: "vertical", gap: "xs" }}>
          {!currentValidity.isValid && currentValidity.errors.length > 0 && (
            <Span $color="critical" className="hint">
              {currentValidity.errors.join(", ")}
            </Span>
          )}
          {fieldDef.hint && <Span className="hint">{fieldDef.hint}</Span>}
        </Span>
      </section>
    );
  },
);
