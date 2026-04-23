import { useSyncInject } from "@lensapp/use-sync-inject";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clusterDescriptorsInjectable } from "../../monorepo-adapters/cluster-descriptors.injectable";
import { registeredResourcePluralsInjectionToken } from "../../monorepo-adapters/registered-resource-plurals.injectable";
import { resolveKubeResourceKindOrUndefinedInjectionToken } from "../../monorepo-adapters/resolve-kube-resource-kind-or-undefined.injectable";
import { normalizeLocationBarSlashes } from "../../_shared/normalize-location-bar-slashes";
import type { Suggestion } from "../suggestions/location-bar-suggestions";
import { buildClusterLookupNames, deriveLocationBarInputView, type LocationBarInputView } from "./derive-location-bar-input-view";
import {
  createLocationBarInputHandlers,
  type LocationBarInputCallbacks,
  type LocationBarInputHandlers,
} from "./location-bar-input-handlers";

export type LocationBarInputModel = LocationBarInputHandlers & {
  readonly inputRef: React.RefObject<HTMLInputElement | null>;
  readonly value: string;
  readonly activeIndex: number;
  readonly isSubmitting: boolean;
  readonly view: LocationBarInputView;
  readonly setNamespaceSuggestions: (suggestions: readonly Suggestion[]) => void;
  readonly setResourceNameSuggestions: (suggestions: readonly Suggestion[]) => void;
};

type UseLocationBarInputModelArgs = LocationBarInputCallbacks & {
  readonly initialValue: string;
};

export const useLocationBarInputModel = ({
  initialValue,
  onSubmit,
  onFinish,
  onCancel,
}: UseLocationBarInputModelArgs): LocationBarInputModel => {
  const clusterDescriptors = useSyncInject(clusterDescriptorsInjectable).get();
  const registeredPlurals = useSyncInject(registeredResourcePluralsInjectionToken);
  const resolveKindOrUndefined = useSyncInject(resolveKubeResourceKindOrUndefinedInjectionToken);

  const clusterLookupNames = useMemo(() => buildClusterLookupNames(clusterDescriptors), [clusterDescriptors]);
  const normalizedInitial = useMemo(
    () => normalizeLocationBarSlashes(initialValue, initialValue.length, clusterLookupNames),
    // Normalize only once for the initial value; subsequent updates come through the change handler.
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-shot normalization
    [],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(normalizedInitial.value);
  const [caret, setCaret] = useState(normalizedInitial.caret);
  const [activeIndex, setActiveIndex] = useState(0);
  const [namespaceSuggestions, setNamespaceSuggestions] = useState<readonly Suggestion[]>([]);
  const [resourceNameSuggestions, setResourceNameSuggestions] = useState<readonly Suggestion[]>([]);
  const [suppressDropdown, setSuppressDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const view = deriveLocationBarInputView(
    { value, caret, suppressDropdown, namespaceSuggestions, resourceNameSuggestions },
    { clusterDescriptors, registeredPlurals, resolveKindOrUndefined },
  );

  useEffect(() => {
    setActiveIndex((previous) =>
      view.activeSuggestions.length === 0 ? 0 : Math.min(previous, view.activeSuggestions.length - 1),
    );
  }, [view.activeSuggestions.length]);

  const handlers = createLocationBarInputHandlers({
    value,
    caret,
    activeIndex,
    view,
    clusterLookupNames,
    setters: { setValue, setCaret, setActiveIndex, setSuppressDropdown, setIsSubmitting },
    callbacks: { onSubmit, onFinish, onCancel },
    inputRef,
  });

  return {
    inputRef,
    value,
    activeIndex,
    isSubmitting,
    view,
    setNamespaceSuggestions,
    setResourceNameSuggestions,
    ...handlers,
  };
};
