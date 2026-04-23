import type React from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Suggestion } from "../suggestions/location-bar-suggestions";
import { insertSuggestionIntoInput } from "./insert-suggestion-into-input";
import { isShareLink } from "../../_shared/parse-share-link";
import { normalizeLocationBarSlashes } from "../../_shared/normalize-location-bar-slashes";
import type { LocationBarInputView } from "./derive-location-bar-input-view";

export type LocationBarInputStateSetters = {
  readonly setValue: Dispatch<SetStateAction<string>>;
  readonly setCaret: Dispatch<SetStateAction<number>>;
  readonly setActiveIndex: Dispatch<SetStateAction<number>>;
  readonly setSuppressDropdown: Dispatch<SetStateAction<boolean>>;
  readonly setIsSubmitting: Dispatch<SetStateAction<boolean>>;
};

export type LocationBarInputCallbacks = {
  readonly onSubmit: (value: string) => Promise<boolean>;
  readonly onFinish: () => void;
  readonly onCancel: () => void;
};

export type LocationBarInputHandlers = {
  readonly handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleSelect: () => void;
  readonly handlePaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  readonly handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly handleBlur: (event: React.FocusEvent<HTMLFormElement>) => void;
  readonly handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly acceptSuggestion: (suggestion: Suggestion) => void;
};

type CreateHandlersArgs = {
  readonly value: string;
  readonly caret: number;
  readonly activeIndex: number;
  readonly view: LocationBarInputView;
  readonly clusterLookupNames: readonly string[];
  readonly setters: LocationBarInputStateSetters;
  readonly callbacks: LocationBarInputCallbacks;
  readonly inputRef: RefObject<HTMLInputElement | null>;
};

const focusAndPlaceCaret = (input: HTMLInputElement, caret: number) => {
  window.requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(caret, caret);
  });
};

export const createLocationBarInputHandlers = ({
  value,
  caret,
  activeIndex,
  view,
  clusterLookupNames,
  setters,
  callbacks,
  inputRef,
}: CreateHandlersArgs): LocationBarInputHandlers => {
  const acceptSuggestion = (suggestion: Suggestion) => {
    const { nextValue, nextCaret } = insertSuggestionIntoInput(
      value,
      view.effectiveRangeStart,
      view.activeSegmentRangeEnd,
      suggestion.insertText,
    );

    setters.setValue(nextValue);
    setters.setCaret(nextCaret);
    setters.setActiveIndex(0);

    if (inputRef.current) {
      focusAndPlaceCaret(inputRef.current, nextCaret);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const rawCaret = event.target.selectionStart ?? rawValue.length;
    const shouldNormalize = rawValue.length > value.length;
    const next = shouldNormalize
      ? normalizeLocationBarSlashes(rawValue, rawCaret, clusterLookupNames)
      : { value: rawValue, caret: rawCaret };

    setters.setValue(next.value);
    setters.setCaret(next.caret);
    setters.setSuppressDropdown(false);

    if (next.value !== rawValue && inputRef.current) {
      focusAndPlaceCaret(inputRef.current, next.caret);
    }
  };

  const handleSelect = () => {
    const input = inputRef.current;

    if (input) {
      setters.setCaret(input.selectionStart ?? input.value.length);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (isShareLink(event.clipboardData.getData("text"))) {
      setters.setSuppressDropdown(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      callbacks.onCancel();
      return;
    }

    if (!view.dropdownIsOpen) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setters.setActiveIndex((previous) => (previous + 1) % view.activeSuggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setters.setActiveIndex(
        (previous) => (previous - 1 + view.activeSuggestions.length) % view.activeSuggestions.length,
      );
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();

      const pickable = view.activeSuggestions[activeIndex];

      if (pickable) {
        acceptSuggestion(pickable);
      }
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const nextFocus = event.relatedTarget as Node | null;

    if (nextFocus && event.currentTarget.contains(nextFocus)) {
      return;
    }

    callbacks.onCancel();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const pickable = view.dropdownIsOpen ? view.activeSuggestions[activeIndex] : undefined;

    let submittedValue = value;
    let caretAfterAccept = caret;

    if (pickable) {
      const accepted = insertSuggestionIntoInput(
        value,
        view.effectiveRangeStart,
        view.activeSegmentRangeEnd,
        pickable.insertText,
        !view.isLastSegment,
      );

      submittedValue = accepted.nextValue;
      caretAfterAccept = accepted.nextCaret;
      setters.setValue(submittedValue);
      setters.setCaret(caretAfterAccept);
    }

    setters.setIsSubmitting(true);

    let success: boolean;

    try {
      success = await callbacks.onSubmit(submittedValue);
    } finally {
      setters.setIsSubmitting(false);
    }

    if (!success) {
      return;
    }

    if (view.isLastSegment) {
      callbacks.onFinish();
      return;
    }

    setters.setActiveIndex(0);
    setters.setSuppressDropdown(false);

    if (inputRef.current) {
      focusAndPlaceCaret(inputRef.current, caretAfterAccept);
    }
  };

  return { acceptSuggestion, handleChange, handleSelect, handlePaste, handleKeyDown, handleBlur, handleSubmit };
};
