export type LocationBarInput = {
  readonly clusterName: string | undefined;
  readonly namespaces: readonly string[] | undefined;
  readonly resourcePath: string | undefined;
  readonly resourceName: string | undefined;
  readonly nonClusterLabel: string | undefined;
};

const allNamespacesSelectedValue = "*";
const defaultNonClusterLabel = "Lens";
const noNamespaceLabel = "—";

/**
 * Built-in Kubernetes resource kinds that live at the cluster scope.
 * The breadcrumb skips the namespace segment for these even if a
 * namespace filter is active, because it doesn't apply to them.
 *
 * Until @lensapp/kube-resource exposes kubeResourceIsNamespaced publicly,
 * this list has to track the built-in cluster-scoped kinds by hand.
 */
const clusterScopedPluralNames: ReadonlySet<string> = new Set([
  "clusterrolebindings",
  "clusterroles",
  "customresourcedefinitions",
  "ingressclasses",
  "mutatingwebhookconfigurations",
  "namespaces",
  "nodes",
  "persistentvolumes",
  "priorityclasses",
  "runtimeclasses",
  "storageclasses",
  "validatingwebhookconfigurations",
]);

const pluralNameFromResourcePath = (path: string): string => {
  const segments = path.split("/").filter(Boolean);

  return segments[segments.length - 1] ?? path;
};

const isClusterScopedPluralName = (pluralName: string): boolean => clusterScopedPluralNames.has(pluralName);

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
    return [input.nonClusterLabel ?? defaultNonClusterLabel];
  }

  const segments: string[] = [input.clusterName];

  const resourcePluralName = input.resourcePath ? pluralNameFromResourcePath(input.resourcePath) : undefined;

  const resourceIsClusterScoped = resourcePluralName !== undefined && isClusterScopedPluralName(resourcePluralName);

  if (input.namespaces !== undefined && !resourceIsClusterScoped) {
    segments.push(formatNamespaces(input.namespaces));
  }

  if (resourcePluralName) {
    segments.push(resourcePluralName);
  }

  if (input.resourceName) {
    segments.push(input.resourceName);
  }

  return segments;
};
