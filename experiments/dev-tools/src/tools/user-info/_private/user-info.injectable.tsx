import { Button, Div, type DivProps } from "@lensapp/element-components";
import { getInjectableComponent } from "@lensapp/injectable-react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import { UserInfoPopover } from "./user-info-popover";
import { lensIdDecodedTokenInjectionToken, lensIdLicenseInjectionToken } from "@lensapp/lens-id";
import { LicenseFeatureChanger } from "./license-feature-changer.injectable";
import { LicenseDisabledFeatureChanger } from "./license-disabled-feature-changer.injectable";
import { visibleDevToolsInjectable } from "../../../in-general/visible-dev-tools.injectable";
import { userInfoDevToolId } from "../user-info-dev-tool-id";
import { LicenseTrialToggle } from "./license-trial-toggle.injectable";
import { LicenseExpirationEditor } from "./license-expiration-editor.injectable";
import type { PropsWithChildren } from "react";

const SeparatedSection = ({ children }: PropsWithChildren<DivProps>) => (
  <Div $border={{ left: { width: "xxs", color: "grey40" } }} $padding={{ left: "s" }}>
    {children}
  </Div>
);

export const UserInfo = getInjectableComponent({
  id: "user-info-component",

  Component: observer(() => {
    const accessToken = useSyncInject(lensIdDecodedTokenInjectionToken).get();
    const license = useSyncInject(lensIdLicenseInjectionToken).get();
    const visibleDevTools = useSyncInject(visibleDevToolsInjectable);

    const close = () => {
      visibleDevTools.set(userInfoDevToolId, false);
    };

    return (
      <Div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}
        $backgroundColor="backgroundSecondary"
        $border={{ width: true, color: "borderPrimary", radius: "l" }}
        $overflow={{ x: "auto" }}
        $padding="xs"
      >
        <Div $flex={{ direction: "horizontal", gap: "s", verticalAlign: "center" }}>
          {accessToken && (
            <Button
              $backgroundColor="backgroundPrimary"
              $padding={{ horizontal: "xs" }}
              $border={{ width: true, color: "borderPrimary", radius: "l" }}
              $popover={() => <UserInfoPopover {...{ accessToken }} />}
              $style={{ flexShrink: 0 }}
              data-user-info-button-test
            >
              User Info
            </Button>
          )}
          {license && (
            <SeparatedSection>
              <LicenseFeatureChanger />
            </SeparatedSection>
          )}
          {license && (
            <SeparatedSection>
              <LicenseDisabledFeatureChanger />
            </SeparatedSection>
          )}
          {license && (
            <SeparatedSection>
              <LicenseTrialToggle />
            </SeparatedSection>
          )}
          {license && (
            <SeparatedSection>
              <LicenseExpirationEditor />
            </SeparatedSection>
          )}
          <Div $style={{ marginLeft: "auto" }}>
            <Button
              $backgroundColor="backgroundPrimary"
              $padding={{ horizontal: "xs" }}
              $border={{ width: true, color: "borderPrimary", radius: "l" }}
              $style={{ flexShrink: 0 }}
              onClick={close}
              data-user-info-close-button-test
            >
              Close
            </Button>
          </Div>
        </Div>
      </Div>
    );
  }),
});
