import { getInjectable } from "@lensapp/injectable";
import { anytimeAfterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { lensThemeDeclarationInjectionToken, lensThemesInjectionToken } from "@lensapp/theme";
import { colorThemeInjectable } from "@lensapp/user-preferences";
import { reaction, runInAction } from "mobx";
import { wantsCustomThemeInjectable } from "./state/wants-custom-theme.injectable";
import { customThemeId } from "./themes/custom-theme-id";

// Two host-side gotchas the experiment has to work around to make Theme Tweaker
// themes survive a restart:
//
//   1. `lensThemesInjectable` builds its theme Map once on first read and does not
//      observe later registrations — so any theme declared by an experiment that
//      loads after the host has already read the map will be missing. We patch
//      our themes in by hand here.
//
//   2. The host's `colorTheme` preference validator (`isColorThemeValidInjectable`)
//      rejects any persisted `lensThemeId` not present in that same Map. Because
//      the validator reads the Map *during* user-preferences `fromStorage` — which
//      runs before this experiment's themes are registered — a persisted
//      "theme-tweaker-custom" is silently dropped and `colorTheme` is reset to the
//      default ("lens-dark"). The user sees the default theme on every restart.
//
// To survive (2) we mirror the user's "I picked a Theme Tweaker theme" intent in
// our own persisted state (`wantsCustomTheme`) and restore `colorTheme` after the
// Map has been patched. A reaction keeps the flag in sync with future changes,
// including a user switching back to a built-in theme via Lens's normal UI.
const registerThemesWithHostMapInjectable = getInjectable({
  id: "theme-tweaker-register-themes-with-host-map",
  instantiate: (di) => ({
    run: async () => {
      const lensThemes = di.inject(lensThemesInjectionToken);
      const allThemes = di.injectMany(lensThemeDeclarationInjectionToken);
      const colorTheme = di.inject(colorThemeInjectable);
      const wantsCustomTheme = await di.inject(wantsCustomThemeInjectable);

      for (const theme of allThemes) {
        lensThemes.set(theme.id, theme);
      }

      if (wantsCustomTheme.get()) {
        runInAction(() => {
          colorTheme.set({ matchSystemTheme: false, lensThemeId: customThemeId });
        });
      }

      reaction(
        () => {
          const pref = colorTheme.get();

          return !pref.matchSystemTheme && pref.lensThemeId === customThemeId;
        },
        (isCustom) => {
          if (wantsCustomTheme.get() !== isCustom) {
            runInAction(() => {
              wantsCustomTheme.set(isCustom);
            });
          }
        },
      );
    },
  }),
  injectionToken: anytimeAfterApplicationIsLoadedInjectionToken,
  causesSideEffects: true,
});

export default registerThemesWithHostMapInjectable;
