import { describe, expect, it } from "vitest";
import { formatNotesDocument, lineId, splitNotesToLines } from "./splitter";

describe("splitNotesToLines", () => {
  it("assigns L1, L2 ids and formats document state", () => {
    const lines = splitNotesToLines("Jane Doe\njane@example.com");
    expect(lines).toEqual([
      { id: "L1", text: "Jane Doe" },
      { id: "L2", text: "jane@example.com" },
    ]);
    expect(formatNotesDocument(lines)).toBe("L1 | Jane Doe\nL2 | jane@example.com");
  });

  it("skips blank lines", () => {
    expect(splitNotesToLines("   \n\n  ")).toEqual([]);
  });

  it("uses one-based line ids", () => {
    expect(lineId(0)).toBe("L1");
    expect(lineId(9)).toBe("L10");
  });
});
