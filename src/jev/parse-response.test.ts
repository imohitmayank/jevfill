import { describe, expect, it } from "vitest";
import { parseJevResponse } from "./parse-response";

describe("parseJevResponse", () => {
  it("maps choice answers to field matches", () => {
    const matches = parseJevResponse(
      [{ fieldId: "field_0", context: { fieldId: "field_0", tagName: "input" } }],
      {
        answers: {
          field_0: { choice: "L2", confidence: 0.92 },
        },
      },
    );

    expect(matches).toEqual([
      { fieldId: "field_0", lineId: "L2", confidence: 0.92 },
    ]);
  });

  it("uses probabilities when present", () => {
    const matches = parseJevResponse(
      [{ fieldId: "field_0", context: { fieldId: "field_0", tagName: "input" } }],
      {
        answers: {
          field_0: {
            probabilities: { L1: 0.1, L2: 0.85, L3: 0.05 },
          },
        },
      },
    );

    expect(matches[0]).toEqual({
      fieldId: "field_0",
      lineId: "L2",
      confidence: 0.85,
    });
  });

  it("returns null line when no answer", () => {
    const matches = parseJevResponse(
      [{ fieldId: "field_0", context: { fieldId: "field_0", tagName: "input" } }],
      { answers: {} },
    );

    expect(matches[0].lineId).toBeNull();
    expect(matches[0].confidence).toBe(0);
  });
});
