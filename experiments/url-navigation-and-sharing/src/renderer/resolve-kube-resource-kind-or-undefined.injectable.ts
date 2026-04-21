import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { type KubeResourceKind, kubeResourceKindByPluralNameInjectionToken } from "@lensapp/kube-resource";

export type ResolveKubeResourceKindOrUndefined = (pluralName: string) => KubeResourceKind | undefined;

export const resolveKubeResourceKindOrUndefinedInjectionToken = getInjectionToken<ResolveKubeResourceKindOrUndefined>({
  id: "resolve-kube-resource-kind-or-undefined",
});

// `@lensapp/kube-resource` exposes only `kubeResourceKindByPluralNameInjectionToken`,
// which throws when the plural isn't registered. Until a `...OrUndefined` variant is
// contributed upstream, this helper localises the exceptions-as-existence-probe
// hack to a single injectable — see .knowledge/rules.md §2.
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
