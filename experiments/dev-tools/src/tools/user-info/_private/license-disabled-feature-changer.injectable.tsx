import { getInjectableComponent } from "@lensapp/injectable-react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import { useCallback, useState } from "react";
import { Button } from "@lensapp/button";
import { setLensIdLicenseDisabledFeaturesInjectable } from "./set-lens-id-license-disabled-features.injectable";
import { disabledFeaturesInjectable } from "./disabled-features.injectable";

export const LicenseDisabledFeatureChanger = getInjectableComponent({
  id: "license-disabled-feature-changer",

  Component: observer(() => {
    const setDisabledFeatures = useSyncInject(setLensIdLicenseDisabledFeaturesInjectable);
    const currentDisabledFeatures = useSyncInject(disabledFeaturesInjectable).get();
    const [isInputVisible, setInputVisible] = useState(false);
    const [newFeatureName, setNewFeatureName] = useState("");

    const handleAddDisabledFeature = useCallback(() => {
      if (newFeatureName.trim()) {
        setDisabledFeatures([...currentDisabledFeatures, newFeatureName.trim()]);
      }

      setInputVisible(false);
    }, [newFeatureName, setDisabledFeatures, currentDisabledFeatures]);

    const handleRemoveDisabledFeature = useCallback(
      (featureName: string) => {
        setDisabledFeatures(currentDisabledFeatures.filter((f) => f !== featureName));
      },
      [setDisabledFeatures, currentDisabledFeatures],
    );

    return (
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", opacity: 0.7, flexShrink: 0 }}>Disabled:</span>
        {currentDisabledFeatures.map((feature) => (
          <Button
            key={feature}
            $padding={{ horizontal: "xs" }}
            $border={{ width: true, color: "borderPrimary", radius: "m" }}
            $style={{ flexShrink: 0 }}
            onClick={() => handleRemoveDisabledFeature(feature)}
            data-disabled-feature-test={feature}
          >
            {feature} ✕
          </Button>
        ))}
        {isInputVisible ? (
          <>
            <input
              type="text"
              style={{ width: "140px", flexShrink: 0 }}
              value={newFeatureName}
              onChange={(x) => setNewFeatureName(x.target.value)}
              data-new-disabled-feature-input-test
              placeholder="FeatureName"
            />
            <Button
              $style={{ flexShrink: 0 }}
              onClick={handleAddDisabledFeature}
              data-confirm-add-disabled-feature-button-test
            >
              ✅
            </Button>
            <Button $style={{ flexShrink: 0 }} onClick={() => setInputVisible(false)}>
              ❌
            </Button>
          </>
        ) : (
          <Button
            $style={{ flexShrink: 0 }}
            onClick={() => {
              setNewFeatureName("");
              setInputVisible(true);
            }}
            data-add-disabled-feature-button-test
          >
            + Disable Feature
          </Button>
        )}
      </div>
    );
  }),
});
