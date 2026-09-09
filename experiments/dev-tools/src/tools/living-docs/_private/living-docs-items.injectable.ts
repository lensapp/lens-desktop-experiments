import { livingDocsEntryInjectionToken } from "@lensapp/living-docs";
import { getInjectable } from "@k8slens/injectable";
import { computedInjectManyInjectionToken } from "@k8slens/injectable-extension-for-mobx";

export const livingDocsItemsInjectable = getInjectable({
  id: "living-docs-entries",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectionToken);
    const items = computedInjectMany(livingDocsEntryInjectionToken);

    return items;
  },
});
