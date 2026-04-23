import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { kubeResourceKindInjectionToken, resourceApiBaseForKindInjectionToken } from "@lensapp/kube-resource";

// TODO(upstream): promote to `@lensapp/kube-resource` as a first-class
// `registeredResourcePluralsInjectionToken`. Autocomplete UIs, help text,
// validators, and docs tooling all need this same derived list; reinventing
// the API-base slicing in every consumer is waste.
export const registeredResourcePluralsInjectionToken = getInjectionToken<readonly string[]>({
  id: "registered-resource-plurals",
});

const pluralFromApiBase = (apiBase: string): string | undefined => {
  const segments = apiBase.split("/").filter(Boolean);

  return segments[segments.length - 1];
};

const registeredResourcePluralsInjectable = getInjectable({
  id: "url-navigation-and-sharing-registered-resource-plurals",

  instantiate: (di): readonly string[] => {
    const kinds = di.injectMany(kubeResourceKindInjectionToken);

    return kinds
      .map((kind) => pluralFromApiBase(di.inject(resourceApiBaseForKindInjectionToken.for(kind))))
      .filter((plural): plural is string => plural !== undefined);
  },

  injectionToken: registeredResourcePluralsInjectionToken,
});

export default registeredResourcePluralsInjectable;
