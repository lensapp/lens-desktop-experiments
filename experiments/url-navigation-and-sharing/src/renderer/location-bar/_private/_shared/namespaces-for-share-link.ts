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
