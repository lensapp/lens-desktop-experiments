export type ParsedLocationBarInput = {
  readonly clusterName: string;
  readonly resourcePluralName: string | undefined;
  readonly namespaces: readonly string[] | undefined;
  readonly resourceName: string | undefined;
};

const namespaceSeparator = ",";

const splitNamespaces = (segment: string | undefined): readonly string[] | undefined => {
  if (segment === undefined) {
    return undefined;
  }

  const names = segment
    .split(namespaceSeparator)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  return names.length > 0 ? names : undefined;
};

/**
 * EKS-style cluster names can contain `/` (e.g.
 * `arn:aws:eks:eu-west-1:841310725496:cluster/eksdemo1`). Naive `/`-splitting
 * then treats the ARN suffix as a resource plural. When we know the
 * registered cluster names, try longest-prefix match first so the cluster
 * name is kept intact no matter how many `/`s it contains.
 */
const matchKnownClusterPrefix = (input: string, knownClusterNames: readonly string[]): string | undefined => {
  const candidates = knownClusterNames
    .filter((name) => input === name || input.startsWith(`${name}/`))
    .sort((a, b) => b.length - a.length);

  return candidates[0];
};

/**
 * Location-bar path layout is `cluster / resourcePlural / namespaces / resourceName`.
 * Putting the plural directly after the cluster means autocomplete after the
 * cluster slot is always a resource-type list; for namespaced kinds the
 * namespace slot follows, and for cluster-scoped kinds the resource name
 * follows (see `resolveClusterScopedSegments` for the shift).
 */
export const parseLocationBarInput = (
  input: string,
  knownClusterNames: readonly string[] = [],
): ParsedLocationBarInput | undefined => {
  const normalized = input.trim().replace(/^\/+/, "").replace(/\/+$/, "");

  if (normalized.length === 0) {
    return undefined;
  }

  const matchedCluster = matchKnownClusterPrefix(normalized, knownClusterNames);

  if (matchedCluster) {
    const remainder = normalized.slice(matchedCluster.length).replace(/^\/+/, "");
    const [resourcePluralName, namespaceSegment, resourceName] = remainder
      .split("/")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);

    return {
      clusterName: matchedCluster,
      resourcePluralName,
      namespaces: splitNamespaces(namespaceSegment),
      resourceName,
    };
  }

  const segments = input
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const [clusterName, resourcePluralName, namespaceSegment, resourceName] = segments;

  if (!clusterName) {
    return undefined;
  }

  return {
    clusterName,
    resourcePluralName,
    namespaces: splitNamespaces(namespaceSegment),
    resourceName,
  };
};

export type IsKindNamespaced = (pluralName: string) => boolean | undefined;

/**
 * For cluster-scoped kinds, the path `cluster/plural/name` has no namespace
 * segment — what the positional parser put in the namespace slot is actually
 * the resource name. Shift it when the scope predicate confirms the kind is
 * not namespaced. If the scope is unknown (predicate returns undefined) or
 * the kind is namespaced, leave the parsed result alone.
 */
export const resolveClusterScopedSegments = (
  parsed: ParsedLocationBarInput,
  isKindNamespaced: IsKindNamespaced,
): ParsedLocationBarInput => {
  if (!parsed.resourcePluralName) {
    return parsed;
  }

  if (isKindNamespaced(parsed.resourcePluralName) !== false) {
    return parsed;
  }

  if (parsed.resourceName !== undefined) {
    return { ...parsed, namespaces: undefined };
  }

  if (parsed.namespaces?.length === 1) {
    return {
      clusterName: parsed.clusterName,
      resourcePluralName: parsed.resourcePluralName,
      namespaces: undefined,
      resourceName: parsed.namespaces[0],
    };
  }

  return parsed;
};
