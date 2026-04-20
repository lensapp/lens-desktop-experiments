import { leftItemInjectionToken } from "@lensapp/top-bar";
import locationBarPlaceholderInjectable from "./location-bar-placeholder.injectable";

describe("location-bar-placeholder", () => {
  it("is a top bar left item", () => {
    expect(locationBarPlaceholderInjectable.injectionToken).toBe(leftItemInjectionToken);
  });
});
