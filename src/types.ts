export interface NoteLine {
  id: string;
  text: string;
}

/** @deprecated Use NoteLine */
export type Span = NoteLine;

export interface FieldContext {
  fieldId: string;
  tagName: string;
  inputType?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
  /** Text from DOM siblings immediately before this field (same parent, nothing after). */
  description?: string;
}

export interface ScannedField {
  fieldId: string;
  context: FieldContext;
}

export interface FieldMatch {
  fieldId: string;
  lineId: string | null;
  confidence: number;
}

export interface StorageData {
  notes: string;
  apiKey?: string;
  confidenceThreshold?: number;
}

export const DEFAULT_CONFIDENCE_THRESHOLD = 0;
export const JEV_MODEL = "jev-1.13.0";
export const MAX_NOTE_LINES = 255;

export interface ClassifyRequest {
  fields: ScannedField[];
  lines: NoteLine[];
}

export interface ClassifyResponse {
  matches: FieldMatch[];
}

export interface AutofillResult {
  filled: number;
  total: number;
}

export type Message =
  | { type: "CLASSIFY"; payload: ClassifyRequest }
  | { type: "CLASSIFY_RESULT"; payload: ClassifyResponse }
  | { type: "CLASSIFY_ERROR"; error: string }
  | { type: "AUTOFILL_PAGE" }
  | { type: "AUTOFILL_RESULT"; payload: AutofillResult }
  | { type: "AUTOFILL_ERROR"; error: string };
