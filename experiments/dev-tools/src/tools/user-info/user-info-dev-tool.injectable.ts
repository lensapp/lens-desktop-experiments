import { getInjectable } from "@lensapp/injectable";
import { devToolInjectionToken } from "../../in-general/dev-tool";
import { UserInfo } from "./_private/user-info.injectable";
import { userInfoDevToolId } from "./user-info-dev-tool-id";

export { userInfoDevToolId };

export const userInfoDevToolInjectable = getInjectable({
  id: "user-info-dev-tool",

  instantiate: () => ({
    id: userInfoDevToolId,
    Component: UserInfo,
  }),

  injectionToken: devToolInjectionToken,
});
