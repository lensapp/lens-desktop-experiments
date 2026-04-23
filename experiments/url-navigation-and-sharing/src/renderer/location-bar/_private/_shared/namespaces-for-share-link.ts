const allNamespacesSelectedValue = "*";

/**
 * Strip the "all namespaces" wildcard before emitting a share link — the
 * receiving Lens should resolve its own wildcard, not inherit ours. If the
 * filter was wildcard-only, return undefined so no namespace segment is
 * written at all.
 */
export const namespacesForShareLink = (namespaces: readonly string[] | undefined): readonly string[] | undefined => {
  if (!namespaces || namespaces.length === 0) {
    return undefined;
  }

  const filtered = namespaces.filter((name) => name !== allNamespacesSelectedValue);

  return filtered.length > 0 ? filtered : undefined;
};

/**
 * Compose the namespace segment for a share link. The filter selection drives
 * the list so a recipient lands with the same multi-namespace context; the
 * object's own namespace is appended when a detail panel is open in a
 * namespace that isn't already part of the filter.
 */
export const buildShareNamespaces = (
  filterNamespaces: readonly string[] | undefined,
  objectNamespace: string | undefined,
): readonly string[] | undefined => {
  if (filterNamespaces && filterNamespaces.length > 0) {
    if (objectNamespace && !filterNamespaces.includes(objectNamespace)) {
      return [...filterNamespaces, objectNamespace];
    }

    return filterNamespaces;
  }

  return objectNamespace ? [objectNamespace] : undefined;
};
