import { getInjectable } from "@lensapp/injectable";
import {
  preferenceNavigationGroupInjectionToken,
  preferenceNavigationItemInjectionToken,
} from "@lensapp/preferences-contracts";
import { themeTweakerPageKind } from "./theme-tweaker-preference-block.injectable";

export const labsPreferenceGroupId = "labs";

export const labsPreferenceGroupInjectable = getInjectable({
  id: "theme-tweaker-labs-preference-group",
  instantiate: () => ({
    id: labsPreferenceGroupId,
    label: "Experimental features",
    orderNumber: 500,
  }),
  injectionToken: preferenceNavigationGroupInjectionToken,
});

export const themeTweakerPreferenceTabInjectable = getInjectable({
  id: "theme-tweaker-preference-tab",
  instantiate: () => ({
    id: "theme-tweaker-tab",
    groupId: labsPreferenceGroupId,
    pathId: themeTweakerPageKind,
    kind: themeTweakerPageKind,
    label: "Theme Tweaker",
    orderNumber: 10,
  }),
  injectionToken: preferenceNavigationItemInjectionToken,
});
