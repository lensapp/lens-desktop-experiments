import { MultiSelect, type MultiValue, type SelectOption } from "@lensapp/select";
import { useCallback } from "react";
import type { EnableableFeature } from "./features.injectable";
import type { SetLensIdLicenseFeatures } from "./set-lens-id-license-features.injectable";

export type Props = {
  setLensIdLicenseFeatures: SetLensIdLicenseFeatures;
  enableableFeatures: EnableableFeature[];
};

export const LicenseFeaturesSelect = ({ setLensIdLicenseFeatures, enableableFeatures }: Props) => {
  const handleChange = useCallback(
    (newValue: MultiValue<SelectOption<unknown>>) => {
      setLensIdLicenseFeatures(
        newValue.map((option) => ({
          name: option.value as string,
          isEnabled: true,
        })),
      );
    },
    [setLensIdLicenseFeatures],
  );

  const options = enableableFeatures.map((feature) => ({
    label: feature.name,
    value: feature.name,
    isSelected: feature.isEnabled,
  }));
  const value = options.filter((option) => option.isSelected).map((option) => option.value);

  return (
    <MultiSelect
      id="user-info-license-features"
      options={options}
      value={value}
      onChange={handleChange}
      themeName="toolbar"
      placeholder="License Features"
    />
  );
};
