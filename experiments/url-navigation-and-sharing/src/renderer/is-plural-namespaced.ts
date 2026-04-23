import type { IsKindNamespaced } from "./parse-location-bar-input";

/**
 * Core Kubernetes kinds that are cluster-scoped. Checked against the plural
 * name typed in the location bar so we can decide whether the segment that
 * follows the plural is a namespace filter or a resource name.
 *
 * `@lensapp/kube-resource` does not publicly expose `isNamespaced` for a
 * given kind, so this is the pragmatic stopgap until that token is exposed
 * (tracked as the `[monorepo]` follow-up in the experiment plan). CRDs that
 * happen to be cluster-scoped fall through to the resource-sample heuristic
 * below when at least one resource has been loaded for them.
 */
const coreClusterScopedPlurals = new Set<string>([
  "nodes",
  "namespaces",
  "persistentvolumes",
  "clusterroles",
  "clusterrolebindings",
  "storageclasses",
  "customresourcedefinitions",
  "componentstatuses",
  "certificatesigningrequests",
  "priorityclasses",
  "ingressclasses",
  "runtimeclasses",
  "validatingwebhookconfigurations",
  "mutatingwebhookconfigurations",
  "podsecuritypolicies",
  "apiservices",
  "flowschemas",
  "prioritylevelconfigurations",
  "csidrivers",
  "csinodes",
  "volumeattachments",
]);

type ResourceSample = {
  readonly metadata: {
    readonly namespace?: string;
    readonly [key: string]: unknown;
  };
};

/**
 * Heuristic: scan a handful of loaded resources for the kind. If any of them
 * carries `.metadata.namespace`, the kind is namespaced. If none do and we
 * saw at least one sample, the kind is cluster-scoped. With no samples we
 * can't tell — return `undefined` and let the caller fall back to positional
 * behaviour.
 */
export const inferScopeFromSamples = (samples: readonly ResourceSample[]): boolean | undefined => {
  if (samples.length === 0) {
    return undefined;
  }

  for (const sample of samples) {
    const namespace = (sample.metadata as { readonly namespace?: string }).namespace;

    if (typeof namespace === "string" && namespace.length > 0) {
      return true;
    }
  }

  return false;
};

/**
 * Hardcoded-only variant: returns `true` only for plurals known at build time
 * to be cluster-scoped. Useful where reactive sample access isn't convenient
 * (e.g. pure render code) and the caller can tolerate "unknown" falling through
 * to the default namespaced treatment.
 */
export const isKnownClusterScopedPlural = (plural: string): boolean => coreClusterScopedPlurals.has(plural);

export const makeIsKindNamespaced = (
  sampleResourcesFor: (plural: string) => readonly ResourceSample[] | undefined,
): IsKindNamespaced => {
  return (plural) => {
    if (coreClusterScopedPlurals.has(plural)) {
      return false;
    }

    const samples = sampleResourcesFor(plural);

    if (!samples) {
      return undefined;
    }

    return inferScopeFromSamples(samples);
  };
};
