import { getInjectableComponent } from "@lensapp/injectable-react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import { LicenseFeaturesSelect } from "./license-features-select";
import { setLensIdLicenseFeaturesInjectable } from "./set-lens-id-license-features.injectable";
import { featuresInjectable } from "./features.injectable";
import { LicenseFeatureAdder } from "./license-feature-adder.injectable";

export const LicenseFeatureChanger = getInjectableComponent({
  id: "license-feature-changer",

  Component: observer(() => {
    const setLensIdLicenseFeatures = useSyncInject(setLensIdLicenseFeaturesInjectable);
    const enableableFeatures = useSyncInject(featuresInjectable).get();

    return (
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <LicenseFeaturesSelect
          setLensIdLicenseFeatures={setLensIdLicenseFeatures}
          enableableFeatures={enableableFeatures}
        />
        <LicenseFeatureAdder
          setLensIdLicenseFeatures={setLensIdLicenseFeatures}
          enableableFeatures={enableableFeatures}
        ></LicenseFeatureAdder>
      </div>
    );
  }),
});
