const defaultSuggestionLimit = 8;

export type Suggestion = {
  readonly label: string;
  readonly insertText: string;
};

const substringMatches = (candidate: string, query: string): boolean =>
  candidate.toLowerCase().includes(query.toLowerCase());

const uniquePreservingOrder = (values: readonly string[]): readonly string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
};

const toSuggestions = (values: readonly string[], query: string, limit: number): readonly Suggestion[] =>
  uniquePreservingOrder(values)
    .filter((value) => query === "" || substringMatches(value, query))
    .slice(0, limit)
    .map((value) => ({ label: value, insertText: value }));

export const suggestClusters = (
  clusterNames: readonly string[],
  query: string,
  limit: number = defaultSuggestionLimit,
): readonly Suggestion[] => toSuggestions(clusterNames, query, limit);

export const suggestNamespaces = (
  namespaces: readonly string[],
  query: string,
  limit: number = defaultSuggestionLimit,
): readonly Suggestion[] => toSuggestions(namespaces, query, limit);

export const suggestResourcePlurals = (
  plurals: readonly string[],
  query: string,
  limit: number = defaultSuggestionLimit,
): readonly Suggestion[] => toSuggestions(plurals, query, limit);

export const suggestResourceNames = (
  names: readonly string[],
  query: string,
  limit: number = defaultSuggestionLimit,
): readonly Suggestion[] => toSuggestions(names, query, limit);

export type CommaTail = {
  readonly alreadyPicked: readonly string[];
  readonly queryStart: number;
  readonly query: string;
};

/**
 * Splits a comma-separated segment into the already-picked prefix and the
 * unfinished tail that autocomplete should match against. Used so the
 * namespace segment can suggest after every comma instead of only when the
 * segment is empty.
 */
export const narrowToCommaTail = (segmentText: string, segmentRangeStart: number): CommaTail => {
  const lastCommaIndex = segmentText.lastIndexOf(",");

  if (lastCommaIndex === -1) {
    return {
      alreadyPicked: [],
      queryStart: segmentRangeStart,
      query: segmentText.trim(),
    };
  }

  const prefix = segmentText.slice(0, lastCommaIndex);
  const alreadyPicked = prefix
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return {
    alreadyPicked,
    queryStart: segmentRangeStart + lastCommaIndex + 1,
    query: segmentText.slice(lastCommaIndex + 1).trim(),
  };
};
