import { getTestUtilRunnableForOverrides } from "@lensapp/test-utils-for-production";
import globalOverrides from "./**/*.global-override-for-injectable.(ts|tsx)";
import defaultOverrides from "./**/*.default-override.(ts|tsx)";

export const testUtilRunnableInjectable = getTestUtilRunnableForOverrides({
  globalOverrides,
  defaultOverrides,
});
