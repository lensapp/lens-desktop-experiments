import { allNamespacesInjectionToken } from "@lensapp/selecting-namespaces";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import type React from "react";
import { useEffect, useMemo } from "react";
import { type Suggestion, suggestNamespaces } from "./location-bar-suggestions";
import { SuggestionsListbox } from "./suggestions-listbox";

const allNamespacesSelectedValue = "*";

type NamespaceSuggestionsProps = {
  readonly anchorRef: React.RefObject<HTMLInputElement | null>;
  readonly clusterId: string;
  readonly query: string;
  readonly alreadyPicked: readonly string[];
  readonly listboxId: string;
  readonly activeIndex: number;
  readonly onPick: (suggestion: Suggestion) => void;
  readonly onSuggestionsChange: (suggestions: readonly Suggestion[]) => void;
};

export const NamespaceSuggestions = observer(
  ({
    anchorRef,
    clusterId,
    query,
    alreadyPicked,
    listboxId,
    activeIndex,
    onPick,
    onSuggestionsChange,
  }: NamespaceSuggestionsProps) => {
    const namespaces = useSyncInject(allNamespacesInjectionToken, clusterId).get();
    const candidateNamespaces = useMemo(() => {
      const excludeSet = new Set(alreadyPicked);
      const filtered = namespaces.filter((name) => !excludeSet.has(name));

      return alreadyPicked.length > 0 ? filtered : [allNamespacesSelectedValue, ...filtered];
    }, [namespaces, alreadyPicked]);
    const suggestions = useMemo(() => suggestNamespaces(candidateNamespaces, query), [candidateNamespaces, query]);

    useEffect(() => {
      onSuggestionsChange(suggestions);
    }, [suggestions, onSuggestionsChange]);

    if (suggestions.length === 0) {
      return null;
    }

    return (
      <SuggestionsListbox
        anchorRef={anchorRef}
        listboxId={listboxId}
        suggestions={suggestions}
        activeIndex={activeIndex}
        onPick={onPick}
      />
    );
  },
);
