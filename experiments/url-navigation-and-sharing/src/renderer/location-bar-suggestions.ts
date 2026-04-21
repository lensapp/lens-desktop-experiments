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
