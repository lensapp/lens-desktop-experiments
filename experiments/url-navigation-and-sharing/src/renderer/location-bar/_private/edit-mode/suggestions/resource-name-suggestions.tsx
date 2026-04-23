import { type KubeResourceKind, kubeResourcesForKindInjectionToken } from "@lensapp/kube-resource";
import { isLoaded } from "@lensapp/loadable-utilities";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import type React from "react";
import { useEffect, useMemo } from "react";
import { type Suggestion, suggestResourceNames } from "./location-bar-suggestions";
import { SuggestionsListbox } from "./suggestions-listbox";

type ResourceNameSuggestionsProps = {
  readonly anchorRef: React.RefObject<HTMLInputElement | null>;
  readonly clusterId: string;
  readonly kind: KubeResourceKind;
  readonly namespace: string | undefined;
  readonly query: string;
  readonly listboxId: string;
  readonly activeIndex: number;
  readonly onPick: (suggestion: Suggestion) => void;
  readonly onSuggestionsChange: (suggestions: readonly Suggestion[]) => void;
};

export const ResourceNameSuggestions = observer(
  ({
    anchorRef,
    clusterId,
    kind,
    namespace,
    query,
    listboxId,
    activeIndex,
    onPick,
    onSuggestionsChange,
  }: ResourceNameSuggestionsProps) => {
    const loadable = useSyncInject(kubeResourcesForKindInjectionToken.for(kind), clusterId).get();
    const suggestions = useMemo(() => {
      if (!isLoaded(loadable)) {
        return [];
      }

      const names = loadable.value
        .filter(
          (resource) =>
            namespace === undefined || (resource.metadata as { readonly namespace?: string }).namespace === namespace,
        )
        .map((resource) => resource.metadata.name);

      return suggestResourceNames(names, query);
    }, [loadable, namespace, query]);

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
