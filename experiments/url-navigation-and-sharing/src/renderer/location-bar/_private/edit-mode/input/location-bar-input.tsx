import { Div, Form, Input, Span } from "@lensapp/element-components";
import { SpinnerIcon } from "@lensapp/icon";
import type { KubeResourceKind } from "@lensapp/kube-resource";
import { observer } from "mobx-react";
import { useId } from "react";
import { NamespaceSuggestions } from "../suggestions/namespace-suggestions";
import { ResourceNameSuggestions } from "../suggestions/resource-name-suggestions";
import { SuggestionsListbox } from "../suggestions/suggestions-listbox";
import { useLocationBarInputModel } from "./use-location-bar-input-model";

type LocationBarInputProps = {
  readonly initialValue: string;
  readonly errorMessage: string | undefined;
  readonly onSubmit: (value: string) => Promise<boolean>;
  readonly onFinish: () => void;
  readonly onCancel: () => void;
};

export const LocationBarInput = observer(
  ({ initialValue, errorMessage, onSubmit, onFinish, onCancel }: LocationBarInputProps) => {
    const listboxId = useId();
    const model = useLocationBarInputModel({ initialValue, onSubmit, onFinish, onCancel });
    const { view, isSubmitting, activeIndex } = model;
    const activeDescendantId = view.dropdownIsOpen ? `${listboxId}-option-${activeIndex}` : undefined;

    return (
      <Form
        onSubmit={model.handleSubmit}
        onBlur={model.handleBlur}
        $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
        $padding={{ horizontal: "s" }}
        $style={{ fontFamily: "monospace", width: "min(40rem, 60vw)" }}
      >
        <Div $style={{ flex: 1, minWidth: 0 }}>
          <Input
            ref={model.inputRef}
            autoFocus
            value={model.value}
            onChange={model.handleChange}
            onKeyDown={model.handleKeyDown}
            onSelect={model.handleSelect}
            onPaste={model.handlePaste}
            readOnly={isSubmitting}
            aria-label="Location input"
            aria-invalid={errorMessage !== undefined}
            aria-autocomplete="list"
            aria-busy={isSubmitting}
            role="combobox"
            aria-expanded={view.dropdownIsOpen && !isSubmitting}
            aria-controls={view.dropdownIsOpen && !isSubmitting ? listboxId : undefined}
            aria-activedescendant={isSubmitting ? undefined : activeDescendantId}
            $style={{
              fontFamily: "monospace",
              width: "100%",
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "inherit",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          />
          {!isSubmitting && view.staticSuggestions.length > 0 && (
            <SuggestionsListbox
              anchorRef={model.inputRef}
              listboxId={listboxId}
              suggestions={view.staticSuggestions}
              activeIndex={activeIndex}
              onPick={model.acceptSuggestion}
            />
          )}
          {!isSubmitting && view.showNamespaceDropdown && (
            <NamespaceSuggestions
              anchorRef={model.inputRef}
              clusterId={view.resolvedClusterId as string}
              query={view.namespaceAutocomplete?.query ?? view.activeSegmentText}
              alreadyPicked={view.namespaceAutocomplete?.alreadyPicked ?? []}
              listboxId={listboxId}
              activeIndex={activeIndex}
              onPick={model.acceptSuggestion}
              onSuggestionsChange={model.setNamespaceSuggestions}
            />
          )}
          {!isSubmitting && view.showResourceNameDropdown && (
            <ResourceNameSuggestions
              anchorRef={model.inputRef}
              clusterId={view.resolvedClusterId as string}
              kind={view.resolvedKind as KubeResourceKind}
              namespace={view.resolvedIsClusterScoped ? undefined : view.resolvedNamespace}
              query={view.activeSegmentText}
              listboxId={listboxId}
              activeIndex={activeIndex}
              onPick={model.acceptSuggestion}
              onSuggestionsChange={model.setResourceNameSuggestions}
            />
          )}
        </Div>
        {isSubmitting && (
          <Span
            role="status"
            aria-label="Navigating"
            $style={{ display: "inline-flex", alignItems: "center", opacity: 0.7 }}
          >
            <SpinnerIcon $size="s" />
          </Span>
        )}
        {!isSubmitting && errorMessage && (
          <Span role="alert" $style={{ color: "var(--colorError)", whiteSpace: "nowrap" }}>
            {errorMessage}
          </Span>
        )}
      </Form>
    );
  },
);
