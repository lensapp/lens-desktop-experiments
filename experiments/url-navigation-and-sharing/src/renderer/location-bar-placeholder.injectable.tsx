import { getInjectable } from "@lensapp/injectable";
import { leftItemInjectionToken } from "@lensapp/top-bar";
import React from "react";

const LocationBarPlaceholder = () => (
  <div
    style={{
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
      fontFamily: "monospace",
      opacity: 0.7,
    }}
  >
    Location bar: placeholder
  </div>
);

const locationBarPlaceholderInjectable = getInjectable({
  id: "url-navigation-and-sharing-location-bar-placeholder",

  instantiate: () => ({
    Component: LocationBarPlaceholder,
    orderNumber: 100,
  }),

  injectionToken: leftItemInjectionToken,
});

export default locationBarPlaceholderInjectable;
