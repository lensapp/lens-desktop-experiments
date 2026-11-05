import { getInjectable2 } from "@k8slens/injectable";
import { preferencePageItemInjectionToken } from "@k8slens/preferences-contracts";
import { ThemeTweakerPage } from "./components/theme-tweaker-page";

export const themeTweakerPageKind = "theme-tweaker";

const themeTweakerPreferenceBlockInjectable = getInjectable2({
  id: "theme-tweaker-preference-block",
  instantiate: () => () => ({
    id: "theme-tweaker-main",
    orderNumber: 10,
    Component: ThemeTweakerPage,
  }),
  injectionToken: preferencePageItemInjectionToken.for(themeTweakerPageKind),
});

export default themeTweakerPreferenceBlockInjectable;
