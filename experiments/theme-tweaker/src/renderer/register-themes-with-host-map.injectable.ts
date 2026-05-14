import { getInjectable } from "@lensapp/injectable";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { lensThemeDeclarationInjectionToken, lensThemesInjectionToken } from "@lensapp/theme";

/**
 * The host's `lensThemes` injectable returns a plain `Map` that's built once on first inject
 * — typically before experiments load. Our newly-registered theme declarations never make it
 * into that map, so `activeTheme.get()` asserts when the user picks one of ours.
 *
 * This runnable closes the gap by re-injecting all declarations after the experiment has
 * registered, and `.set()`-ing each into the existing Map. Map.set is idempotent, so re-adding
 * built-in themes is a no-op.
 */
const registerThemesWithHostMapInjectable = getInjectable({
  id: "theme-tweaker-register-themes-with-host-map",
  instantiate: (di) => ({
    run: () => {
      const lensThemes = di.inject(lensThemesInjectionToken);
      const allThemes = di.injectMany(lensThemeDeclarationInjectionToken);

      for (const theme of allThemes) {
        lensThemes.set(theme.id, theme);
      }
    },
  }),
  injectionToken: anytimeAfterApplicationIsLoadedInjectionToken,
  causesSideEffects: true,
});

export default registerThemesWithHostMapInjectable;
