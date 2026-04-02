import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";

export const visibleDevToolsInjectable = getInjectable({
  id: "visible-dev-tools",
  instantiate: () => observable.map<string, boolean>(),
});
