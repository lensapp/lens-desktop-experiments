/**
 * Replaces the active segment of the input with the suggestion's insert text,
 * preserving the leading/trailing whitespace that existed around the segment
 * (so caret bookkeeping stays stable). When `appendSeparator` is true and the
 * text after the segment doesn't already start with `/`, a `/` is inserted so
 * the caret lands at the start of the next segment ready for more input.
 */
export const insertSuggestionIntoInput = (
  value: string,
  rangeStart: number,
  rangeEnd: number,
  insertText: string,
  appendSeparator = false,
): { readonly nextValue: string; readonly nextCaret: number } => {
  const slot = value.slice(rangeStart, rangeEnd);
  const leading = slot.slice(0, slot.length - slot.trimStart().length);
  const trailingLength = slot.length - slot.trimEnd().length;
  const trailing = trailingLength === 0 ? "" : slot.slice(slot.length - trailingLength);
  const before = value.slice(0, rangeStart);
  const after = value.slice(rangeEnd);
  const separator = appendSeparator && !after.startsWith("/") ? "/" : "";
  const nextValue = `${before}${leading}${insertText}${separator}${trailing}${after}`;
  const nextCaret = before.length + leading.length + insertText.length + separator.length;

  return { nextValue, nextCaret };
};
