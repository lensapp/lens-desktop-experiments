import { getInjectable } from "@lensapp/injectable";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { lensThemeDeclarationInjectionToken, lensThemesInjectionToken } from "@lensapp/theme";

// Workaround: host's lensThemesInjectable builds its Map once on first read and does not
// observe later registrations, so experiment-registered theme declarations need to be
// patched in by hand.
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
