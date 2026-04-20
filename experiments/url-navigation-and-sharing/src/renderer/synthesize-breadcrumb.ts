export type LocationBarInput = {
  readonly clusterName: string | undefined;
  readonly namespaces: readonly string[] | undefined;
  readonly resourceType: string | undefined;
  readonly resourceName: string | undefined;
};

const nonClusterLabel = "Lens";
const noNamespaceLabel = "—";
const allNamespacesSelectedValue = "*";

const formatNamespaces = (namespaces: readonly string[]): string => {
  if (namespaces.length === 0) {
    return noNamespaceLabel;
  }

  if (namespaces.includes(allNamespacesSelectedValue)) {
    return "All namespaces";
  }

  if (namespaces.length === 1) {
    return namespaces[0];
  }

  return `${namespaces.length} namespaces`;
};

export const synthesizeBreadcrumb = (input: LocationBarInput): readonly string[] => {
  if (!input.clusterName) {
    return [nonClusterLabel];
  }

  const segments: string[] = [input.clusterName];

  if (input.namespaces !== undefined) {
    segments.push(formatNamespaces(input.namespaces));
  }

  if (input.resourceType) {
    segments.push(input.resourceType);
  }

  if (input.resourceName) {
    segments.push(input.resourceName);
  }

  return segments;
};
