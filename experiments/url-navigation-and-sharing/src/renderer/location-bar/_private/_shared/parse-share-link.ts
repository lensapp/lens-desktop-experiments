// TODO(upstream): promote `isShareLink` / `parseShareLink` / `formatShareLink`
// to `@lensapp/share-common` next to `getCustomProtocolUrl()`. The monorepo
// already owns the forward direction of this URL grammar; the inverse belongs
// next to it so every deep-link handler (main-process URL routing, telemetry,
// tests) uses the same parser.

export type ParsedShareLink = {
  readonly sourceSlug: string;
  readonly clusterSpecifier: string;
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

// Matches `<slug>:<specifier>(/|$)` at the very start of the (trimmed) input.
// The slug must begin with a letter and may contain letters, digits, and
// hyphens. The specifier segment must not contain any further `:` so that ARNs
// like `arn:aws:eks:...:cluster/eksdemo1` — which have several `:` before the
// first `/` — aren't misread as share links.
const shareLinkPrefixRegex = /^[a-z][a-z0-9-]*:[^:/]+(?:\/|$)/i;

export const isShareLink = (input: string): boolean => shareLinkPrefixRegex.test(input.trimStart());

export const parseShareLink = (input: string): ParsedShareLink | undefined => {
  const trimmed = input.trim();

  if (!isShareLink(trimmed)) {
    return undefined;
  }

  const colonIndex = trimmed.indexOf(":");
  const sourceSlug = trimmed.slice(0, colonIndex);
  const rest = trimmed.slice(colonIndex + 1).replace(/\/+$/, "");

  // Reject leading slashes: `slug:/foo` or `lens://...` both imply a missing
  // specifier. We bail rather than silently shifting segments, otherwise
  // `lens://app/...` would parse as if `app` were the cluster specifier.
  if (rest.length === 0 || rest.startsWith("/")) {
    return undefined;
  }

  const [clusterSpecifier, resourcePluralName, namespace, resourceName] = rest
    .split("/")
    .map((segment) => segment.trim());

  if (!sourceSlug || !clusterSpecifier) {
    return undefined;
  }

  return {
    sourceSlug,
    clusterSpecifier,
    resourcePluralName: resourcePluralName || undefined,
    namespaces: splitNamespaces(namespace || undefined),
    resourceName: resourceName || undefined,
  };
};

export const formatShareLink = (parsed: ParsedShareLink): string => {
  const namespacesSegment = parsed.namespaces?.join(namespaceSeparator);
  const path = [parsed.clusterSpecifier, parsed.resourcePluralName, namespacesSegment, parsed.resourceName]
    .filter((segment): segment is string => Boolean(segment))
    .join("/");

  return `${parsed.sourceSlug}:${path}`;
};
