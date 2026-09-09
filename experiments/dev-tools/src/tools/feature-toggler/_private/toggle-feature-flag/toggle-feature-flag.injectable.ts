import { expectDefined } from "@lensapp/utilities";
import { featureFlagInjectionToken } from "@k8slens/feature-core";
import { getInjectable } from "@k8slens/injectable";
import { runInAction } from "mobx";
import { hackComputedAsOverridable } from "../../../_shared/hack-computed-as-overridable";

export const toggleFeatureFlagInjectable = getInjectable({
  id: "toggle-feature-flag",

  instantiate: (di) => (flagId: string) => {
    const { instance: featureFlag } = expectDefined(
      di.injectManyWithMeta(featureFlagInjectionToken).find((x) => x.meta.id === flagId),
    );

    const hacked = hackComputedAsOverridable(featureFlag);

    runInAction(() => {
      hacked.setOverride(!featureFlag.get());
    });
  },
});
