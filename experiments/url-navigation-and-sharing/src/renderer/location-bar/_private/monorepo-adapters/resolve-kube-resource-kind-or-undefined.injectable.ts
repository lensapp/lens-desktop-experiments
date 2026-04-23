import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { type KubeResourceKind, kubeResourceKindByPluralNameInjectionToken } from "@lensapp/kube-resource";

export type ResolveKubeResourceKindOrUndefined = (pluralName: string) => KubeResourceKind | undefined;

export const resolveKubeResourceKindOrUndefinedInjectionToken = getInjectionToken<ResolveKubeResourceKindOrUndefined>({
  id: "resolve-kube-resource-kind-or-undefined",
});

// TODO(upstream): promote this as `kubeResourceKindByPluralNameOrUndefinedInjectionToken`
// in `@lensapp/kube-resource`, next to the throwing `kubeResourceKindByPluralNameInjectionToken`.
// Every autocomplete/validation consumer that takes unvetted plural names from
// the user hits this same wall, and an exceptions-as-existence-probe is the
// wrong contract. Once upstream ships, delete this adapter and consume the
// token directly.
const resolveKubeResourceKindOrUndefinedInjectable = getInjectable({
  id: "url-navigation-and-sharing-resolve-kube-resource-kind-or-undefined",

  instantiate:
    (di): ResolveKubeResourceKindOrUndefined =>
    (pluralName) => {
      try {
        return di.inject(kubeResourceKindByPluralNameInjectionToken.for(pluralName));
      } catch {
        return undefined;
      }
    },

  injectionToken: resolveKubeResourceKindOrUndefinedInjectionToken,
});

export default resolveKubeResourceKindOrUndefinedInjectable;
