import { normalizeLocationBarSlashes } from "./normalize-location-bar-slashes";

describe("normalizeLocationBarSlashes", () => {
  it("leaves an unseparated value alone", () => {
    expect(normalizeLocationBarSlashes("cluster", 7)).toEqual({ value: "cluster", caret: 7 });
  });

  it("pads a slash typed at the end of a segment", () => {
    expect(normalizeLocationBarSlashes("cluster/", 8)).toEqual({ value: "cluster / ", caret: 10 });
  });

  it("pads a slash typed between existing segments and lands caret after the padding", () => {
    expect(normalizeLocationBarSlashes("cluster/pods", 8)).toEqual({ value: "cluster / pods", caret: 10 });
  });

  it("is idempotent on already-padded input", () => {
    expect(normalizeLocationBarSlashes("cluster / pods", 10)).toEqual({ value: "cluster / pods", caret: 10 });
  });

  it("pads multiple slashes in a single pass", () => {
    expect(normalizeLocationBarSlashes("a/b/c/d", 7)).toEqual({ value: "a / b / c / d", caret: 13 });
  });

  it("pads a slash typed in the middle of a segment and keeps caret after the padding", () => {
    const typed = "clu/ster";

    expect(normalizeLocationBarSlashes(typed, 4)).toEqual({ value: "clu / ster", caret: 6 });
  });

  it("collapses redundant whitespace around a slash to a single space on each side", () => {
    expect(normalizeLocationBarSlashes("cluster   /   pods", 18)).toEqual({
      value: "cluster / pods",
      caret: 14,
    });
  });

  it("keeps a trailing slash padded so the next segment can be typed directly", () => {
    expect(normalizeLocationBarSlashes("cluster / pods /", 16)).toEqual({
      value: "cluster / pods / ",
      caret: 17,
    });
  });

  describe("with an ARN cluster name containing slashes", () => {
    const arn = "arn:aws:eks:eu-west-1:841310725496:cluster/eksdemo1";

    it("keeps slashes inside the ARN untouched when the ARN is the entire input", () => {
      expect(normalizeLocationBarSlashes(arn, arn.length, [arn])).toEqual({
        value: arn,
        caret: arn.length,
      });
    });

    it("pads only the separator after a completed ARN", () => {
      const input = `${arn}/pods`;

      expect(normalizeLocationBarSlashes(input, input.length, [arn])).toEqual({
        value: `${arn} / pods`,
        caret: `${arn} / pods`.length,
      });
    });

    it("is idempotent on a padded ARN + segment", () => {
      const padded = `${arn} / pods`;

      expect(normalizeLocationBarSlashes(padded, padded.length, [arn])).toEqual({
        value: padded,
        caret: padded.length,
      });
    });

    it("does not pad an internal slash while the user is still typing a prefix of a known ARN", () => {
      const partial = "arn:aws:eks:eu-west-1:841310725496:cluster/";

      expect(normalizeLocationBarSlashes(partial, partial.length, [arn])).toEqual({
        value: partial,
        caret: partial.length,
      });
    });
  });
});
