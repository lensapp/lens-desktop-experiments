import { getInjectionToken } from "@lensapp/injectable";

export type DevTool = {
  id: string;
  Component: React.ComponentType<{}>;
};

export const devToolInjectionToken = getInjectionToken<DevTool>({
  id: "dev-tool",
});
