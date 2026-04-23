// Direct-cluster slugs are derived from the navigator's display name for the
// cluster source ("EKS", "Local Kubeconfigs"…). Lowercasing and hyphenating
// whitespace gives a URL-safe token that matches what the user sees in the
// sidebar, so the share link's `eks:` / `local-kubeconfigs:` prefix stays
// recognisable across Lens installs.
export const slugifyNavigatorName = (name: string): string => name.trim().toLowerCase().replace(/\s+/g, "-");

// Teamwork (Lens Spaces) clusters use a fixed slug. On the paste side, it is
// the sole signal that tells us to resolve the specifier as a teamwork UUID
// rather than a direct server-address hash.
export const teamworkSourceSlug = "lens-spaces";

export const connectionTypeForSlug = (slug: string): "direct" | "teamwork" =>
  slug === teamworkSourceSlug ? "teamwork" : "direct";
