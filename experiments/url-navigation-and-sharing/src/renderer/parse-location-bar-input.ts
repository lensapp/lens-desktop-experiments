export type ParsedLocationBarInput = {
  readonly clusterName: string;
  readonly namespaces: readonly string[] | undefined;
  readonly resourcePluralName: string | undefined;
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
 * then treats the ARN suffix as a namespace. When we know the registered
 * cluster names, try longest-prefix match first so the cluster name is kept
 * intact no matter how many `/`s it contains.
 */
const matchKnownClusterPrefix = (input: string, knownClusterNames: readonly string[]): string | undefined => {
  const candidates = knownClusterNames
    .filter((name) => input === name || input.startsWith(`${name}/`))
    .sort((a, b) => b.length - a.length);

  return candidates[0];
};

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
    const [namespaceSegment, resourcePluralName, resourceName] = remainder
      .split("/")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);

    return {
      clusterName: matchedCluster,
      namespaces: splitNamespaces(namespaceSegment),
      resourcePluralName,
      resourceName,
    };
  }

  const segments = input
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const [clusterName, namespaceSegment, resourcePluralName, resourceName] = segments;

  if (!clusterName) {
    return undefined;
  }

  return {
    clusterName,
    namespaces: splitNamespaces(namespaceSegment),
    resourcePluralName,
    resourceName,
  };
};

export type CanResolvePlural = (pluralName: string) => boolean;

/**
 * Cluster-scoped resources render as `cluster / plural` (no namespace slot), so
 * naive positional parsing of `cluster/nodes` puts `nodes` in the namespace
 * slot. This shifts the segments when the namespace slot resolves as a known
 * plural and the plural slot does not — making the edit ↔ display round-trip
 * work for cluster-scoped kinds without requiring the user to type a
 * placeholder. Only a single namespace slot can hold a plural misread, so the
 * shift only applies when exactly one namespace was parsed.
 */
export const resolveLocationSegments = (
  parsed: ParsedLocationBarInput,
  canResolvePlural: CanResolvePlural,
): ParsedLocationBarInput => {
  if (parsed.resourcePluralName && canResolvePlural(parsed.resourcePluralName)) {
    return parsed;
  }

  const firstNamespace = parsed.namespaces?.length === 1 ? parsed.namespaces[0] : undefined;

  if (firstNamespace && canResolvePlural(firstNamespace)) {
    return {
      clusterName: parsed.clusterName,
      namespaces: undefined,
      resourcePluralName: firstNamespace,
      resourceName: parsed.resourcePluralName,
    };
  }

  return parsed;
};
