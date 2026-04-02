import { withChildDiKludgeBunch } from "./_private/with-child-di-kludge-bunch";
import { toggleFeatureFlagInjectable } from "./toggle-feature-flag.injectable";

export const kludge = withChildDiKludgeBunch(toggleFeatureFlagInjectable);
