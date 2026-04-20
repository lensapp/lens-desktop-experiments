export type ClusterBreadcrumbInput = {
  readonly clusterName: string;
  readonly namespaces: readonly string[] | undefined;
  readonly resourcePath: string | undefined;
  readonly resourceName: string | undefined;
};

const allNamespacesSelectedValue = "*";
const noNamespaceLabel = "—";

/**
 * Built-in Kubernetes resource kinds that live at the cluster scope.
 * The breadcrumb skips the namespace segment for these even if a
 * namespace filter is active, because it doesn't apply to them.
 *
 * TODO: replace with `kubeResourceIsNamespaced` once that predicate is
 * exposed publicly from `@lensapp/kube-resource`. Until then, this list
 * has to track the built-in cluster-scoped kinds by hand.
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

export const synthesizeClusterBreadcrumb = (input: ClusterBreadcrumbInput): readonly string[] => {
  const segments: string[] = [input.clusterName];

  const resourcePluralName = input.resourcePath ? pluralNameFromResourcePath(input.resourcePath) : undefined;

  const resourceIsClusterScoped = resourcePluralName !== undefined && clusterScopedPluralNames.has(resourcePluralName);

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
