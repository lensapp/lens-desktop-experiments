import { Div, Span } from "@lensapp/element-components";
import { Button } from "@lensapp/button";
import { Input } from "@lensapp/input";
import { useEffect, useRef, useState } from "react";
import type { CustomThemeMode } from "../../state/custom-theme-mode.injectable";
import type { ThemeTweakerActions } from "./theme-tweaker-actions.injectable";

const SAVED_MESSAGE_TIMEOUT_MS = 3000;

interface ManageBarProps {
  readonly currentMode: CustomThemeMode;
  readonly actions: ThemeTweakerActions;
  readonly pendingName: string;
  readonly onPendingNameChange: (name: string) => void;
}

export const ManageBar = ({ currentMode, actions, pendingName, onPendingNameChange }: ManageBarProps) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (savedMessage === null) {
      return;
    }

    const id = window.setTimeout(() => setSavedMessage(null), SAVED_MESSAGE_TIMEOUT_MS);

    return () => window.clearTimeout(id);
  }, [savedMessage]);

  const handleSave = () => {
    const trimmed = pendingName.trim();

    if (actions.saveCurrentAs(pendingName, currentMode)) {
      onPendingNameChange("");
      setSavedMessage(`Saved as "${trimmed}"`);
    }
  };

  return (
    <Div $flex={{ direction: "horizontal", verticalAlign: "center", gap: "s", wrap: true }}>
      <Input theme="round-black" placeholder="Theme name…" value={pendingName} onChange={onPendingNameChange} />
      <Button label="Save as…" primary onClick={handleSave} />
      <Button label={`Reset ${currentMode}`} onClick={() => actions.resetCurrentMode(currentMode)} />
      <Button label="Export JSON" onClick={() => actions.exportCurrent(currentMode)} />
      <Div $hidden>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              void actions.importTheme(file);
            }

            e.target.value = "";
          }}
        />
      </Div>
      <Button label="Import JSON" onClick={() => importInputRef.current?.click()} />
      {savedMessage ? (
        <Span
          role="status"
          aria-live="polite"
          $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
          $font={{ size: "xs", bold: "600" }}
          $color="success"
        >
          <Span aria-hidden>✓</Span>
          {savedMessage}
        </Span>
      ) : null}
    </Div>
  );
};
