import { debugLog } from "../debug";
import type { FieldMatch, ScannedField } from "../types";

interface JevChoiceAnswer {
  choice?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
}

interface JevResponseBody {
  answers?: Record<string, JevChoiceAnswer>;
}

function pickChoice(answer: JevChoiceAnswer | undefined): { lineId: string | null; confidence: number } {
  if (!answer) {
    return { lineId: null, confidence: 0 };
  }

  if (answer.probabilities && Object.keys(answer.probabilities).length > 0) {
    let bestLineId: string | null = null;
    let bestConfidence = 0;

    for (const [lineId, probability] of Object.entries(answer.probabilities)) {
      if (probability > bestConfidence) {
        bestLineId = lineId;
        bestConfidence = probability;
      }
    }

    return { lineId: bestLineId, confidence: bestConfidence };
  }

  const choice = answer.choice ?? null;
  const confidence = answer.confidence ?? 0;
  return { lineId: choice, confidence };
}

export function parseJevResponse(
  fields: ScannedField[],
  response: JevResponseBody,
): FieldMatch[] {
  const answers = response.answers ?? {};

  const matches = fields.map((field) => {
    const { lineId, confidence } = pickChoice(answers[field.fieldId]);

    return {
      fieldId: field.fieldId,
      lineId,
      confidence,
    };
  });

  const matched = matches.filter((m) => m.lineId !== null).length;
  debugLog("Parsed Jev matches", {
    total: matches.length,
    withLine: matched,
    withoutLine: matches.length - matched,
  });

  return matches;
}
