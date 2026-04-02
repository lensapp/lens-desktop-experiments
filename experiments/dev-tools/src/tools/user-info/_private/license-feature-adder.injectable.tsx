import { getInjectableComponent } from "@lensapp/injectable-react";
import { observer } from "mobx-react";
import { useCallback, useState } from "react";
import { Button } from "@lensapp/button";
import { Input } from "@lensapp/element-components";
import type { SetLensIdLicenseFeatures } from "./set-lens-id-license-features.injectable";
import type { EnableableFeature } from "./features.injectable";

interface Props {
  setLensIdLicenseFeatures: SetLensIdLicenseFeatures;
  enableableFeatures: EnableableFeature[];
}

export const LicenseFeatureAdder = getInjectableComponent({
  id: "license-feature-adder",

  Component: observer(({ setLensIdLicenseFeatures, enableableFeatures }: Props) => {
    const [isFeatureInputVisible, setInputVisible] = useState(false);
    const [newFeatureName, setNewFeatureName] = useState("");

    const handleStartAddingFeature = useCallback(() => {
      setNewFeatureName("");
      setInputVisible(true);
    }, []);

    const handleAddFeature = useCallback(() => {
      if (newFeatureName.trim()) {
        setLensIdLicenseFeatures([
          ...enableableFeatures,
          {
            name: newFeatureName.trim(),
            isEnabled: true,
          },
        ]);
      }

      setInputVisible(false);
    }, [newFeatureName.trim, setLensIdLicenseFeatures, enableableFeatures, newFeatureName]);

    const handleCancelAddFeature = useCallback(() => {
      setInputVisible(false);
    }, []);

    return (
      <>
        {isFeatureInputVisible && (
          <>
            <Input
              $width="full"
              type="text"
              $border={{ width: true, color: "borderPrimary", radius: "m" }}
              value={newFeatureName}
              onChange={(x) => setNewFeatureName(x.target.value)}
              data-new-feature-input-test
              placeholder="NewFeatureName"
            />
            <Button onClick={handleAddFeature} data-confirm-add-feature-button-test>
              ✅
            </Button>
            <Button onClick={handleCancelAddFeature}>❌</Button>
          </>
        )}
        {!isFeatureInputVisible && (
          <Button onClick={handleStartAddingFeature} data-add-feature-button-test>
            Add Feature
          </Button>
        )}
      </>
    );
  }),
});
