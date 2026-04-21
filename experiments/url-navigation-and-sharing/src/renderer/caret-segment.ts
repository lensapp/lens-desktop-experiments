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

export const getActiveSegment = (input: string, caret: number): ActiveSegment => {
  const clampedCaret = Math.max(0, Math.min(caret, input.length));
  const index = countOccurrencesBefore(input, segmentSeparator, clampedCaret);
  const previousSeparator = lastIndexOfBefore(input, segmentSeparator, clampedCaret);
  const rangeStart = previousSeparator + 1;
  const rangeEnd = indexOfAtOrAfter(input, segmentSeparator, clampedCaret);
  const text = input.slice(rangeStart, rangeEnd).trim();

  return { index, rangeStart, rangeEnd, text };
};
