import { getInjectable } from "@lensapp/injectable";
import { observable } from "mobx";
import { savedThemesStorageKey } from "./storage-keys";

export interface SavedTheme {
  readonly name: string;
  readonly createdAt: string;
  readonly mode: "dark" | "light";
  readonly colors: Readonly<Record<string, string>>;
}

const isSavedTheme = (value: unknown): value is SavedTheme => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const v = value as Partial<SavedTheme>;

  return (
    typeof v.name === "string" &&
    typeof v.createdAt === "string" &&
    (v.mode === "dark" || v.mode === "light" || v.mode === undefined) &&
    !!v.colors &&
    typeof v.colors === "object" &&
    Object.values(v.colors as Record<string, unknown>).every((c) => typeof c === "string")
  );
};

const readPersisted = (): ReadonlyArray<SavedTheme> => {
  try {
    const raw = window.localStorage.getItem(savedThemesStorageKey);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSavedTheme).map((t) => ({ ...t, mode: t.mode ?? "dark" }));
  } catch {
    return [];
  }
};

export const savedThemesInjectable = getInjectable({
  id: "theme-tweaker-saved-themes",
  instantiate: () => observable.array<SavedTheme>([...readPersisted()], { deep: false }),
});
