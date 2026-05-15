import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { getPersistedInjectionToken } from "@lensapp/persisted-state";

export interface SavedTheme {
  readonly name: string;
  readonly createdAt: string;
  readonly mode: "dark" | "light";
  readonly colors: Readonly<Record<string, string>>;
}

export const savedThemesPersistedInjectable = getInjectable({
  id: "theme-tweaker-saved-themes-persisted",
  instantiate: (di) => {
    const getPersisted = di.inject(getPersistedInjectionToken);

    return getPersisted(["theme-tweaker", "saved-themes"], observable.array<SavedTheme>([], { deep: false }));
  },
});

export const savedThemesInjectable = getInjectable({
  id: "theme-tweaker-saved-themes",
  instantiate: (di) => di.inject(savedThemesPersistedInjectable).promise(),
});
