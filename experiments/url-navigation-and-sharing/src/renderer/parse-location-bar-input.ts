export type ParsedLocationBarInput = {
  readonly clusterName: string;
  readonly namespace: string | undefined;
  readonly resourcePluralName: string | undefined;
  readonly resourceName: string | undefined;
};

export const parseLocationBarInput = (input: string): ParsedLocationBarInput | undefined => {
  const segments = input
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const [clusterName, namespace, resourcePluralName, resourceName] = segments;

  if (!clusterName) {
    return undefined;
  }

  return {
    clusterName,
    namespace,
    resourcePluralName,
    resourceName,
  };
};

export type CanResolvePlural = (pluralName: string) => boolean;

/**
 * Cluster-scoped resources render as `cluster / plural` (no namespace slot), so
 * naive positional parsing of `cluster/nodes` puts `nodes` in `namespace`. This
 * shifts the segments when the namespace slot resolves as a known plural and
 * the plural slot does not — making the edit ↔ display round-trip work for
 * cluster-scoped kinds without requiring the user to type a placeholder.
 */
export const resolveLocationSegments = (
  parsed: ParsedLocationBarInput,
  canResolvePlural: CanResolvePlural,
): ParsedLocationBarInput => {
  if (parsed.resourcePluralName && canResolvePlural(parsed.resourcePluralName)) {
    return parsed;
  }

  if (parsed.namespace && canResolvePlural(parsed.namespace)) {
    return {
      clusterName: parsed.clusterName,
      namespace: undefined,
      resourcePluralName: parsed.namespace,
      resourceName: parsed.resourcePluralName,
    };
  }

  return parsed;
};
