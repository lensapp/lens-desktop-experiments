const allNamespacesSelectedValue = "*";

/**
 * Compose the namespace segment for a share link. The filter selection drives
 * the list so a recipient lands with the same multi-namespace context; the
 * object's own namespace is appended when a detail panel is open in a
 * namespace that isn't already part of the filter. When the filter is the
 * "all namespaces" wildcard, it already subsumes the object's namespace, so
 * we keep the wildcard on its own instead of appending.
 */
export const buildShareNamespaces = (
  filterNamespaces: readonly string[] | undefined,
  objectNamespace: string | undefined,
): readonly string[] | undefined => {
  if (filterNamespaces && filterNamespaces.length > 0) {
    if (filterNamespaces.includes(allNamespacesSelectedValue)) {
      return filterNamespaces;
    }

    if (objectNamespace && !filterNamespaces.includes(objectNamespace)) {
      return [...filterNamespaces, objectNamespace];
    }

    return filterNamespaces;
  }

  return objectNamespace ? [objectNamespace] : undefined;
};
