import { getInjectable } from "@lensapp/injectable";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { lensThemeDeclarationInjectionToken, lensThemesInjectionToken } from "@lensapp/theme";
import { colorThemeInjectable } from "@lensapp/user-preferences";
import { runInAction } from "mobx";

// Workaround: host's lensThemesInjectable builds its Map once on first read and does not
// observe later registrations, so experiment-registered theme declarations need to be
// patched in by hand.
//
// On startup the host's theme-renderer fires a reaction on `activeTheme` before this
// runs. If the persisted `colorTheme.lensThemeId` is one of ours, that first evaluation
// throws "Missing theme declaration" inside the host's `activeTheme` computed and
// `applyLensTheme` is never called — so the page sits on whatever default CSS is baked
// in. After we patch the map we re-set `colorTheme` to a fresh object reference, which
// invalidates the cached error and lets the host's reaction re-evaluate against the
// now-populated map.
const registerThemesWithHostMapInjectable = getInjectable({
  id: "theme-tweaker-register-themes-with-host-map",
  instantiate: (di) => ({
    run: () => {
      const lensThemes = di.inject(lensThemesInjectionToken);
      const allThemes = di.injectMany(lensThemeDeclarationInjectionToken);
      const colorTheme = di.inject(colorThemeInjectable);

      const patchedIds = new Set<string>();

      for (const theme of allThemes) {
        if (!lensThemes.has(theme.id)) {
          patchedIds.add(theme.id);
        }
        lensThemes.set(theme.id, theme);
      }

      const current = colorTheme.get();

      if (!current.matchSystemTheme && patchedIds.has(current.lensThemeId)) {
        runInAction(() => {
          colorTheme.set({ ...current });
        });
      }
    },
  }),
  injectionToken: anytimeAfterApplicationIsLoadedInjectionToken,
  causesSideEffects: true,
});

export default registerThemesWithHostMapInjectable;
