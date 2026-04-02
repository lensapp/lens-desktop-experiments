import { Label } from "@lensapp/element-components";
import { getInjectableComponent } from "@lensapp/injectable-react";
import { observer } from "mobx-react";
import { lensIdLicenseInjectionToken } from "@lensapp/lens-id";
import { setLensIdLicenseTrialInjectable } from "./set-lens-id-license-trial.injectable";
import { useSyncInject } from "@lensapp/use-sync-inject";

export const LicenseTrialToggle = getInjectableComponent({
  id: "license-trial-toggle",

  Component: observer(() => {
    const license = useSyncInject(lensIdLicenseInjectionToken).get();
    const setLensIdLicenseTrial = useSyncInject(setLensIdLicenseTrialInjectable);

    if (!license) {
      return null;
    }

    return (
      <Label $flex={{ direction: "horizontal", gap: "xs", verticalAlign: "center" }} $style={{ flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={license.trial}
          onChange={(e) => setLensIdLicenseTrial(e.target.checked)}
          data-license-trial-toggle-test
        />
        Trial
      </Label>
    );
  }),
});
