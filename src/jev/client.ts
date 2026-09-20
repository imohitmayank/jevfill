import { debugLog, debugTimer } from "../debug";
import { buildJevRequest } from "./build-request";
import { parseJevResponse } from "./parse-response";
import type { FieldMatch, NoteLine, ScannedField } from "../types";

const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone";

export async function classifyFields(
  apiKey: string,
  fields: ScannedField[],
  lines: NoteLine[],
): Promise<FieldMatch[]> {
  if (fields.length === 0) {
    debugLog("No fields to classify");
    return [];
  }

  if (lines.length === 0) {
    debugLog("No note lines provided, returning empty matches");
    return fields.map((field) => ({
      fieldId: field.fieldId,
      lineId: null,
      confidence: 0,
    }));
  }

  const body = buildJevRequest(fields, lines);
  const requestBody = JSON.stringify(body);
  debugLog("Jev API request body", body);
  debugLog("Calling Jev API", {
    endpoint: JEV_ENDPOINT,
    fieldCount: fields.length,
    lineCount: lines.length,
    questionCount: Object.keys(body.questions).length,
    payloadBytes: requestBody.length,
  });

  const endFetch = debugTimer("Jev API fetch");
  const response = await fetch(JEV_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: requestBody,
  });
  endFetch();

  debugLog("Jev API response", { status: response.status, ok: response.ok });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jev API error (${response.status}): ${errorText}`);
  }

  const endParse = debugTimer("Jev response parse");
  const data = (await response.json()) as Record<string, unknown>;
  debugLog("Jev API response body", data);
  const matches = parseJevResponse(fields, data);
  endParse();
  return matches;
}
