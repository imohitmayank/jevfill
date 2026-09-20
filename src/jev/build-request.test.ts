import { describe, expect, it } from "vitest";
import { buildJevRequest } from "./build-request";

describe("buildJevRequest", () => {
  it("builds Jev request state and one choice question per field", () => {
    const request = buildJevRequest(
      [
        {
          fieldId: "field_0",
          context: {
            fieldId: "field_0",
            tagName: "input",
            description: "Full name",
            name: "full_name",
          },
        },
      ],
      [
        { id: "L1", text: "Jane Doe" },
        { id: "L2", text: "jane@example.com" },
      ],
    );

    expect(request.model).toBe("jev-1.13.0");
    expect(request.state).toBe("L1 | Jane Doe\nL2 | jane@example.com");
    expect(request.questions.field_0.type).toBe("choice");
    expect(request.questions.field_0.criteria).toEqual({
      L1: null,
      L2: null,
    });
    expect(request.questions.field_0.instructions).toContain("Full name");
    expect(request.questions.field_0.instructions).toContain(
      "Which line of the document contains the best value",
    );
  });
});
