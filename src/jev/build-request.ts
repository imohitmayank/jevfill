import { formatNotesDocument } from "../splitter";
import { JEV_MODEL, MAX_NOTE_LINES, type NoteLine, type ScannedField } from "../types";

export interface JevChoiceQuestion {
  type: "choice";
  instructions: string;
  criteria: Record<string, null>;
}

export interface JevRequestBody {
  model: string;
  state: string;
  questions: Record<string, JevChoiceQuestion>;
}

function buildFieldInstructions(field: ScannedField): string {
  const parts = [
    "Which line of the document contains the best value to enter into this form field?",
  ];
  const ctx = field.context;

  if (ctx.description) {
    parts.push(`Field description: ${ctx.description}`);
  }
  if (ctx.placeholder) {
    parts.push(`Placeholder: ${ctx.placeholder}`);
  }
  if (ctx.name) {
    parts.push(`Name: ${ctx.name}`);
  }
  if (ctx.id) {
    parts.push(`Id: ${ctx.id}`);
  }
  if (ctx.inputType) {
    parts.push(`Input type: ${ctx.inputType}`);
  }
  if (ctx.ariaLabel) {
    parts.push(`Aria label: ${ctx.ariaLabel}`);
  }
  if (ctx.tagName) {
    parts.push(`Tag: ${ctx.tagName}`);
  }

  return parts.join("\n");
}

function buildLineCriteria(lines: NoteLine[]): Record<string, null> {
  return Object.fromEntries(lines.map((line) => [line.id, null]));
}

export function buildJevRequest(fields: ScannedField[], lines: NoteLine[]): JevRequestBody {
  if (lines.length > MAX_NOTE_LINES) {
    throw new Error(
      `Notes have ${lines.length} lines; Jev choice questions support at most ${MAX_NOTE_LINES} options`,
    );
  }

  const lineCriteria = buildLineCriteria(lines);
  const questions: JevRequestBody["questions"] = {};

  for (const field of fields) {
    questions[field.fieldId] = {
      type: "choice",
      instructions: buildFieldInstructions(field),
      criteria: { ...lineCriteria },
    };
  }

  return {
    model: JEV_MODEL,
    state: formatNotesDocument(lines),
    questions,
  };
}
