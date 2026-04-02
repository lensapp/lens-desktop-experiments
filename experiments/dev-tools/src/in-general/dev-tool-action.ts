import { getInjectionToken } from "@lensapp/injectable";

export type DevToolAction = {
  action: () => void;
  name: string;
};

export const devToolActionInjectionToken = getInjectionToken<DevToolAction>({
  id: "dev-tool-action",
});
