const clusterSourceSuffix = "-cluster-source";

// Cluster sources conventionally register their injectable id with a
// `-cluster-source` suffix (e.g. `local-kubeconfig-cluster-source`). Stripping
// it gives a short, human-friendly slug for the share link prefix — e.g.
// `local-kubeconfig:<hash>/...` rather than the verbose
// `local-kubeconfig-cluster-source:<hash>/...`.
export const normalizeSourceSlug = (sourceId: string): string =>
  sourceId.endsWith(clusterSourceSuffix) ? sourceId.slice(0, -clusterSourceSuffix.length) : sourceId;

// Teamwork (Lens Spaces) clusters use a fixed slug. On the paste side, it is
// the sole signal that tells us to resolve the specifier as a teamwork UUID
// rather than a direct server-address hash.
export const teamworkSourceSlug = "lens-spaces";

export const connectionTypeForSlug = (slug: string): "direct" | "teamwork" =>
  slug === teamworkSourceSlug ? "teamwork" : "direct";
