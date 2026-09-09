import { getInjectable } from "@k8slens/injectable";
import { observable } from "mobx";

export const visibleDevToolsInjectable = getInjectable({
  id: "visible-dev-tools",
  instantiate: () => observable.map<string, boolean>(),
});
