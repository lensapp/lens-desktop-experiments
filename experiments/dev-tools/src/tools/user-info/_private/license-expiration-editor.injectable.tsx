import { Label } from "@lensapp/element-components";
import { getInjectableComponent } from "@lensapp/injectable-react";
import { observer } from "mobx-react";
import { lensIdLicenseInjectionToken } from "@lensapp/lens-id";
import { setLensIdLicenseExpiresAtInjectable } from "./set-lens-id-license-expires-at.injectable";
import { useSyncInject } from "@lensapp/use-sync-inject";

const toDatetimeLocalValue = (epochMs: number): string => {
  const date = new Date(epochMs);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const LicenseExpirationEditor = getInjectableComponent({
  id: "license-expiration-editor",

  Component: observer(() => {
    const license = useSyncInject(lensIdLicenseInjectionToken).get();
    const setLensIdLicenseExpiresAt = useSyncInject(setLensIdLicenseExpiresAtInjectable);

    if (!license) {
      return null;
    }

    return (
      <Label $flex={{ direction: "horizontal", gap: "xs", verticalAlign: "center" }} $style={{ flexShrink: 0 }}>
        Expires:
        <input
          type="datetime-local"
          value={toDatetimeLocalValue(license.expiresAt)}
          onChange={(e) => {
            const ms = new Date(e.target.value).getTime();

            if (!Number.isNaN(ms)) {
              setLensIdLicenseExpiresAt(ms);
            }
          }}
          data-license-expiration-editor-test
        />
      </Label>
    );
  }),
});
