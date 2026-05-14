import { getInjectable } from "@lensapp/injectable";
import { preferencePageItemInjectionToken } from "@lensapp/preferences-contracts";
import { ThemeTweakerPage } from "./components/theme-tweaker-page";

export const themeTweakerPageKind = "theme-tweaker";

const themeTweakerPreferenceBlockInjectable = getInjectable({
  id: "theme-tweaker-preference-block",
  instantiate: () => ({
    id: "theme-tweaker-main",
    orderNumber: 10,
    Component: ThemeTweakerPage,
  }),
  injectionToken: preferencePageItemInjectionToken.for(themeTweakerPageKind),
});

export default themeTweakerPreferenceBlockInjectable;
