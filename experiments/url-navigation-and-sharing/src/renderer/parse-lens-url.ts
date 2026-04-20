export type ParsedLensUrl = {
  readonly connectionType: string;
  readonly clusterSpecifier: string;
  readonly tail: string;
  readonly search: Readonly<Record<string, string>>;
};

const lensUrlProtocol = "lens:";
const lensUrlHost = "app";
const lensUrlBasePathSegment = "open";

export const isLensUrl = (input: string): boolean => input.trimStart().startsWith("lens://");

export const parseLensUrl = (input: string): ParsedLensUrl | undefined => {
  const trimmed = input.trim();

  if (!isLensUrl(trimmed)) {
    return undefined;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return undefined;
  }

  if (url.protocol !== lensUrlProtocol || url.host !== lensUrlHost) {
    return undefined;
  }

  const [base, connectionType, clusterSpecifier, frame, ...rest] = url.pathname.split("/").filter(Boolean);

  if (base !== lensUrlBasePathSegment || !connectionType || !clusterSpecifier || !frame) {
    return undefined;
  }

  const tail = rest.length > 0 ? `/${rest.join("/")}` : "";
  const search: Record<string, string> = {};

  for (const [key, value] of url.searchParams.entries()) {
    search[key] = value;
  }

  return { connectionType, clusterSpecifier, tail, search };
};
