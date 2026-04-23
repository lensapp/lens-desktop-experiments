import { useSyncInject } from "@lensapp/use-sync-inject";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { clusterDescriptorsInjectable } from "../../monorepo-adapters/cluster-descriptors.injectable";
import { registeredResourcePluralsInjectionToken } from "../../monorepo-adapters/registered-resource-plurals.injectable";
import { resolveKubeResourceKindOrUndefinedInjectionToken } from "../../monorepo-adapters/resolve-kube-resource-kind-or-undefined.injectable";
import type { Suggestion } from "../suggestions/location-bar-suggestions";
import { deriveLocationBarInputView, type LocationBarInputView } from "./derive-location-bar-input-view";
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

  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);
  const [caret, setCaret] = useState(initialValue.length);
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
