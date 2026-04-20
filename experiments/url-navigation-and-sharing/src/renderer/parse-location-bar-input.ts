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
