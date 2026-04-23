const segmentSeparator = "/";

export type SlashNormalizationResult = {
  readonly value: string;
  readonly caret: number;
};

const matchArnClusterPrefix = (input: string, knownClusterNames: readonly string[]): string | undefined => {
  const candidates = knownClusterNames
    .filter((name) => name.includes(segmentSeparator))
    .filter((name) => {
      if (input === name) {
        return true;
      }

      if (!input.startsWith(name)) {
        return false;
      }

      return /^\s*\//.test(input.slice(name.length));
    })
    .sort((a, b) => b.length - a.length);

  return candidates[0];
};

const isTypingArnPrefix = (input: string, knownClusterNames: readonly string[]): boolean =>
  input.length > 0 &&
  knownClusterNames.some(
    (name) => name.includes(segmentSeparator) && name !== input && name.startsWith(input),
  );

/**
 * Pads every `/` separator with a single space on each side so edit mode
 * mirrors the visual rhythm of view mode. An ARN-style cluster name whose
 * own identifier contains `/` is kept intact — only separators *after* the
 * cluster slot get padded. While a user is still typing such an ARN (input
 * is a proper prefix of a known name), normalization is skipped so the
 * internal `/` isn't mistaken for a segment boundary.
 */
export const normalizeLocationBarSlashes = (
  value: string,
  caret: number,
  knownClusterNames: readonly string[] = [],
): SlashNormalizationResult => {
  if (isTypingArnPrefix(value, knownClusterNames)) {
    return { value, caret };
  }

  const arnPrefix = matchArnClusterPrefix(value, knownClusterNames);
  const prefixEnd = arnPrefix ? arnPrefix.length : 0;

  const prefix = value.slice(0, prefixEnd);
  const rest = value.slice(prefixEnd);
  const clampedCaret = Math.max(0, Math.min(caret, value.length));
  const restCaret = Math.max(0, clampedCaret - prefixEnd);

  let output = "";
  let outputCaret: number | null = null;
  let i = 0;

  while (i < rest.length) {
    if (i === restCaret && outputCaret === null) {
      outputCaret = output.length;
    }

    let slashAt = i;

    while (slashAt < rest.length && rest[slashAt] === " ") {
      slashAt++;
    }

    if (slashAt < rest.length && rest[slashAt] === segmentSeparator) {
      for (let x = i; x < slashAt; x++) {
        if (x === restCaret && outputCaret === null) {
          outputCaret = output.length;
        }
      }

      output += " / ";

      if (slashAt === restCaret && outputCaret === null) {
        outputCaret = output.length - 1;
      }

      i = slashAt + 1;

      while (i < rest.length && rest[i] === " ") {
        if (i === restCaret && outputCaret === null) {
          outputCaret = output.length;
        }

        i++;
      }

      continue;
    }

    output += rest[i];
    i++;
  }

  if (outputCaret === null) {
    outputCaret = output.length;
  }

  return { value: prefix + output, caret: prefixEnd + outputCaret };
};
