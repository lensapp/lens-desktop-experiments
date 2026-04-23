import type { KubeResourceKind } from "@lensapp/kube-resource";
import {
  type ClusterDescriptor,
  findClusterByDisplayNameOrName,
} from "../../monorepo-adapters/cluster-descriptors.injectable";
import type { ResolveKubeResourceKindOrUndefined } from "../../monorepo-adapters/resolve-kube-resource-kind-or-undefined.injectable";
import {
  narrowToCommaTail,
  suggestClusters,
  suggestResourcePlurals,
  type Suggestion,
} from "../suggestions/location-bar-suggestions";
import { getActiveSegment } from "./caret-segment";
import { isKnownClusterScopedPlural } from "../../_shared/is-plural-namespaced";
import { parseLocationBarInput } from "../../_shared/parse-location-bar-input";

const allNamespacesSelectedValue = "*";

export type LocationBarInputFormState = {
  readonly value: string;
  readonly caret: number;
  readonly suppressDropdown: boolean;
  readonly namespaceSuggestions: readonly Suggestion[];
  readonly resourceNameSuggestions: readonly Suggestion[];
};

export type LocationBarInputDeps = {
  readonly clusterDescriptors: readonly ClusterDescriptor[];
  readonly registeredPlurals: readonly string[];
  readonly resolveKindOrUndefined: ResolveKubeResourceKindOrUndefined;
};

export type LocationBarInputView = {
  readonly activeSegmentText: string;
  readonly activeSegmentIndex: number;
  readonly effectiveRangeStart: number;
  readonly activeSegmentRangeEnd: number;
  readonly resolvedClusterId: string | undefined;
  readonly resolvedKind: KubeResourceKind | undefined;
  readonly resolvedIsClusterScoped: boolean;
  readonly resolvedNamespace: string | undefined;
  readonly staticSuggestions: readonly Suggestion[];
  readonly showNamespaceDropdown: boolean;
  readonly namespaceAutocomplete: { readonly query: string; readonly alreadyPicked: readonly string[] } | undefined;
  readonly showResourceNameDropdown: boolean;
  readonly activeSuggestions: readonly Suggestion[];
  readonly dropdownIsOpen: boolean;
  readonly isLastSegment: boolean;
};

const buildClusterLookupNames = (descriptors: readonly ClusterDescriptor[]): readonly string[] => {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const descriptor of descriptors) {
    for (const candidate of [descriptor.displayName, descriptor.name]) {
      if (!seen.has(candidate)) {
        seen.add(candidate);
        names.push(candidate);
      }
    }
  }

  return names;
};

export const deriveLocationBarInputView = (
  state: LocationBarInputFormState,
  deps: LocationBarInputDeps,
): LocationBarInputView => {
  const { value, caret, suppressDropdown, namespaceSuggestions, resourceNameSuggestions } = state;
  const { clusterDescriptors, registeredPlurals, resolveKindOrUndefined } = deps;

  const clusterLookupNames = buildClusterLookupNames(clusterDescriptors);
  const activeSegment = getActiveSegment(value, caret, clusterLookupNames);
  const parsed = parseLocationBarInput(value, clusterLookupNames);

  const resolvedClusterId = parsed
    ? findClusterByDisplayNameOrName(clusterDescriptors, parsed.clusterName)?.id
    : undefined;
  const resolvedKind = parsed?.resourcePluralName ? resolveKindOrUndefined(parsed.resourcePluralName) : undefined;
  const resolvedIsClusterScoped =
    parsed?.resourcePluralName !== undefined && isKnownClusterScopedPlural(parsed.resourcePluralName);
  const resolvedNamespace =
    parsed?.namespaces && parsed.namespaces.length === 1 && parsed.namespaces[0] !== allNamespacesSelectedValue
      ? parsed.namespaces[0]
      : undefined;

  const staticSuggestions: readonly Suggestion[] = suppressDropdown
    ? []
    : activeSegment.index === 0
      ? suggestClusters(
          clusterDescriptors.map((descriptor) => descriptor.displayName),
          activeSegment.text,
        )
      : activeSegment.index === 1
        ? suggestResourcePlurals(registeredPlurals, activeSegment.text)
        : [];

  const showNamespaceDropdown =
    !suppressDropdown &&
    activeSegment.index === 2 &&
    !resolvedIsClusterScoped &&
    resolvedClusterId !== undefined &&
    resolvedKind !== undefined;

  const namespaceAutocomplete = showNamespaceDropdown
    ? narrowToCommaTail(activeSegment.text, activeSegment.rangeStart)
    : undefined;

  const showResourceNameDropdown =
    !suppressDropdown &&
    resolvedClusterId !== undefined &&
    resolvedKind !== undefined &&
    ((activeSegment.index === 2 && resolvedIsClusterScoped) || activeSegment.index === 3);

  const activeSuggestions: readonly Suggestion[] = showResourceNameDropdown
    ? resourceNameSuggestions
    : showNamespaceDropdown
      ? namespaceSuggestions
      : staticSuggestions;

  const isLastSegment = activeSegment.index >= 3 || (activeSegment.index === 2 && resolvedIsClusterScoped);

  return {
    activeSegmentText: activeSegment.text,
    activeSegmentIndex: activeSegment.index,
    effectiveRangeStart: namespaceAutocomplete?.queryStart ?? activeSegment.rangeStart,
    activeSegmentRangeEnd: activeSegment.rangeEnd,
    resolvedClusterId,
    resolvedKind,
    resolvedIsClusterScoped,
    resolvedNamespace,
    staticSuggestions,
    showNamespaceDropdown,
    namespaceAutocomplete,
    showResourceNameDropdown,
    activeSuggestions,
    dropdownIsOpen: activeSuggestions.length > 0,
    isLastSegment,
  };
};
