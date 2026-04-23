export const pluralNameFromResourcePath = (path: string | undefined): string | undefined => {
  if (!path) {
    return undefined;
  }

  const segments = path.split("/").filter(Boolean);

  return segments[segments.length - 1];
};
