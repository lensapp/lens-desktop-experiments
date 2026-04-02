import { Div } from "@lensapp/element-components";
import type { AccessToken } from "@lensapp/lens-id";

export const UserInfoPopover = ({ accessToken }: { accessToken: AccessToken }) => (
  <Div
    $backgroundColor="backgroundPrimary"
    $border={{ width: true, color: "borderPrimary", radius: "l" }}
    $padding="xs"
    $style={{ maxWidth: "650px", maxHeight: "400px" }}
    $overflow={{ x: "auto", y: "scroll" }}
    $font={{ size: "xs" }}
  >
    <Div>
      <pre data-user-token-test={accessToken.preferred_username}>{JSON.stringify(accessToken, null, 2)}</pre>
    </Div>
  </Div>
);
