const clusterSourceSuffix = "-cluster-source";

// Cluster sources conventionally register their injectable id with a
// `-cluster-source` suffix (e.g. `local-kubeconfig-cluster-source`). We strip
// the suffix so the share-link prefix reads as `local-kubeconfig:<hash>/...`
// instead of `local-kubeconfig-cluster-source:<hash>/...`. The raw id is
// preserved when the convention is not followed, so unknown sources still
// round-trip unambiguously.
export const normalizeSourceSlug = (sourceId: string): string =>
  sourceId.endsWith(clusterSourceSuffix) ? sourceId.slice(0, -clusterSourceSuffix.length) : sourceId;

export const denormalizeSourceSlug = (slug: string): string =>
  slug.endsWith(clusterSourceSuffix) ? slug : `${slug}${clusterSourceSuffix}`;

// Registered upstream as `@lensapp/lens-spaces` cluster source. The only
// public signal we have for "cluster identifier is a server-assigned UUID"
// vs "cluster identifier is an address hash."
const teamworkSourceIds: ReadonlySet<string> = new Set(["lens-spaces-cluster-source"]);

export const connectionTypeForSource = (sourceId: string): "direct" | "teamwork" =>
  teamworkSourceIds.has(sourceId) ? "teamwork" : "direct";
