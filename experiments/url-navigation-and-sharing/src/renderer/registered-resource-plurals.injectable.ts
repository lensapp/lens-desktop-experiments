import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { kubeResourceKindInjectionToken, resourceApiBaseForKindInjectionToken } from "@lensapp/kube-resource";

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
