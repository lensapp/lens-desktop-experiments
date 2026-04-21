const segmentSeparator = "/";

export type ActiveSegment = {
  readonly index: number;
  readonly rangeStart: number;
  readonly rangeEnd: number;
  readonly text: string;
};

const countOccurrencesBefore = (input: string, character: string, limitExclusive: number): number => {
  let count = 0;

  for (let i = 0; i < limitExclusive; i++) {
    if (input[i] === character) {
      count++;
    }
  }

  return count;
};

const indexOfAtOrAfter = (input: string, character: string, start: number): number => {
  const found = input.indexOf(character, start);

  return found === -1 ? input.length : found;
};

const lastIndexOfBefore = (input: string, character: string, limitExclusive: number): number => {
  for (let i = limitExclusive - 1; i >= 0; i--) {
    if (input[i] === character) {
      return i;
    }
  }

  return -1;
};

/**
 * Cluster names can contain `/` (EKS ARNs), in which case segment 0 spans
 * multiple `/`-delimited chunks. When we can match a known cluster name as a
 * prefix of the input, keep that whole prefix as segment 0 and resume normal
 * positional logic past the trailing `/`.
 */
const matchClusterPrefix = (input: string, knownClusterNames: readonly string[]): string | undefined => {
  const candidates = knownClusterNames
    .filter((name) => input === name || input.startsWith(`${name}${segmentSeparator}`))
    .sort((a, b) => b.length - a.length);

  return candidates[0];
};

export const getActiveSegment = (
  input: string,
  caret: number,
  knownClusterNames: readonly string[] = [],
): ActiveSegment => {
  const clampedCaret = Math.max(0, Math.min(caret, input.length));
  const matchedCluster = matchClusterPrefix(input, knownClusterNames);

  if (matchedCluster?.includes(segmentSeparator)) {
    if (clampedCaret <= matchedCluster.length) {
      return {
        index: 0,
        rangeStart: 0,
        rangeEnd: matchedCluster.length,
        text: matchedCluster,
      };
    }

    const afterClusterStart = matchedCluster.length + 1;
    const rest = input.slice(afterClusterStart);
    const restCaret = clampedCaret - afterClusterStart;
    const separatorsBefore = countOccurrencesBefore(rest, segmentSeparator, restCaret);
    const prevSeparatorInRest = lastIndexOfBefore(rest, segmentSeparator, restCaret);
    const nextSeparatorInRest = indexOfAtOrAfter(rest, segmentSeparator, restCaret);
    const rangeStart = afterClusterStart + prevSeparatorInRest + 1;
    const rangeEnd = afterClusterStart + nextSeparatorInRest;

    return {
      index: separatorsBefore + 1,
      rangeStart,
      rangeEnd,
      text: input.slice(rangeStart, rangeEnd).trim(),
    };
  }

  const index = countOccurrencesBefore(input, segmentSeparator, clampedCaret);
  const previousSeparator = lastIndexOfBefore(input, segmentSeparator, clampedCaret);
  const rangeStart = previousSeparator + 1;
  const rangeEnd = indexOfAtOrAfter(input, segmentSeparator, clampedCaret);
  const text = input.slice(rangeStart, rangeEnd).trim();

  return { index, rangeStart, rangeEnd, text };
};
