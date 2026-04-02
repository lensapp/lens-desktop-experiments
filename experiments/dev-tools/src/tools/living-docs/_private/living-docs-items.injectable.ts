import { livingDocsEntryInjectionToken } from "@lensapp/living-docs";
import { getInjectable } from "@lensapp/injectable";
import { computedInjectManyInjectionToken } from "@lensapp/injectable-extension-for-mobx";

export const livingDocsItemsInjectable = getInjectable({
  id: "living-docs-entries",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectionToken);
    const items = computedInjectMany(livingDocsEntryInjectionToken);

    return items;
  },
});
