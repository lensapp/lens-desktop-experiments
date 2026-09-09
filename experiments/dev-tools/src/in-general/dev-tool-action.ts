import { getInjectionToken } from "@k8slens/injectable";

export type DevToolAction = {
  action: () => void;
  name: string;
};

export const devToolActionInjectionToken = getInjectionToken<DevToolAction>({
  id: "dev-tool-action",
});
