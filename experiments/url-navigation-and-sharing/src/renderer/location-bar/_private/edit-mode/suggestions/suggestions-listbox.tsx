import { Li, Ul } from "@lensapp/element-components";
import type React from "react";
import { createPortal } from "react-dom";
import type { Suggestion } from "./location-bar-suggestions";
import { useAnchorRect } from "./use-anchor-rect";

type SuggestionsListboxProps = {
  readonly anchorRef: React.RefObject<HTMLInputElement | null>;
  readonly listboxId: string;
  readonly suggestions: readonly Suggestion[];
  readonly activeIndex: number;
  readonly onPick: (suggestion: Suggestion) => void;
};

export const SuggestionsListbox = ({
  anchorRef,
  listboxId,
  suggestions,
  activeIndex,
  onPick,
}: SuggestionsListboxProps) => {
  const rect = useAnchorRect(anchorRef);

  if (!rect) {
    return null;
  }

  return createPortal(
    <Ul
      id={listboxId}
      role="listbox"
      $style={{
        position: "fixed",
        top: `${rect.bottom + 2}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        margin: 0,
        padding: "4px 0",
        listStyle: "none",
        background: "var(--inputControlBackground, #1e1e1e)",
        border: "1px solid var(--inputControlBorder, rgba(127,127,127,0.3))",
        borderRadius: "4px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        maxHeight: "16rem",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      {suggestions.map((suggestion, index) => {
        const optionId = `${listboxId}-option-${index}`;

        return (
          <Li
            key={optionId}
            id={optionId}
            role="option"
            aria-selected={index === activeIndex}
            onMouseDown={(event: React.MouseEvent<HTMLLIElement>) => {
              event.preventDefault();
              onPick(suggestion);
            }}
            $style={{
              padding: "4px 12px",
              cursor: "pointer",
              background: index === activeIndex ? "var(--menuActiveBackground, rgba(127,127,127,0.15))" : "transparent",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {suggestion.label}
          </Li>
        );
      })}
    </Ul>,
    document.body,
  );
};
