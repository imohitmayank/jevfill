import type { NoteLine } from "./types";

export function lineId(index: number): string {
  return `L${index + 1}`;
}

export function splitNotesToLines(notes: string): NoteLine[] {
  const lines: NoteLine[] = [];

  for (const rawLine of notes.split(/\r?\n/)) {
    const text = rawLine.trim();
    if (!text) {
      continue;
    }
    lines.push({ id: "", text });
  }

  return lines.map((line, index) => ({
    ...line,
    id: lineId(index),
  }));
}

/** @deprecated Use splitNotesToLines */
export const splitNotesToSpans = splitNotesToLines;

export function formatNotesDocument(lines: NoteLine[]): string {
  return lines.map((line) => `${line.id} | ${line.text}`).join("\n");
}
