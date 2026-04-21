import { getActiveSegment } from "./caret-segment";

describe("getActiveSegment", () => {
  it("returns segment 0 with the whole input when there is no separator", () => {
    const result = getActiveSegment("mini", 4);

    expect(result).toEqual({ index: 0, rangeStart: 0, rangeEnd: 4, text: "mini" });
  });

  it("returns segment 1 when caret is after the first separator", () => {
    const input = "cluster / default";
    const caretAfterSeparator = input.indexOf("d");
    const result = getActiveSegment(input, caretAfterSeparator);

    expect(result.index).toBe(1);
    expect(result.text).toBe("default");
  });

  it("reports segment 2 for resource plural segment", () => {
    const input = "cluster / default / pods";
    const caret = input.length;

    expect(getActiveSegment(input, caret)).toMatchObject({ index: 2, text: "pods" });
  });

  it("reports segment 3 for resource name segment", () => {
    const input = "cluster / default / pods / my-pod";

    expect(getActiveSegment(input, input.length)).toMatchObject({ index: 3, text: "my-pod" });
  });

  it("returns trimmed segment text", () => {
    const input = "cluster /   default   / pods";

    expect(getActiveSegment(input, input.indexOf("default") + 1)).toMatchObject({
      index: 1,
      text: "default",
    });
  });

  it("gives a range that spans the separator-free slice containing the caret", () => {
    const input = "cluster / default / pods";
    const caret = input.indexOf("default");
    const result = getActiveSegment(input, caret);

    expect(input.slice(result.rangeStart, result.rangeEnd)).toBe(" default ");
  });

  it("caret at the separator belongs to the preceding segment", () => {
    const input = "cluster/default";
    const caretAtSlash = input.indexOf("/");
    const result = getActiveSegment(input, caretAtSlash);

    expect(result.index).toBe(0);
    expect(result.text).toBe("cluster");
  });

  it("caret one past the separator belongs to the following segment", () => {
    const input = "cluster/default";
    const caretAfterSlash = input.indexOf("/") + 1;
    const result = getActiveSegment(input, caretAfterSlash);

    expect(result.index).toBe(1);
    expect(result.text).toBe("default");
  });

  it("treats an empty segment as empty text", () => {
    const input = "cluster / / pods";
    const caret = input.indexOf("/ pods");
    const result = getActiveSegment(input, caret);

    expect(result.index).toBe(1);
    expect(result.text).toBe("");
  });

  it("clamps caret beyond input length to the end", () => {
    const input = "cluster";

    expect(getActiveSegment(input, 999)).toEqual({ index: 0, rangeStart: 0, rangeEnd: 7, text: "cluster" });
  });
});
