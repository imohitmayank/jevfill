import type { FieldMatch, NoteLine } from "./types";

const HIGHLIGHT_CLASS = "jevfill-filled";
const HIGHLIGHT_DURATION_MS = 3000;

function ensureHighlightStyles(doc: Document): void {
  if (doc.getElementById("jevfill-styles")) {
    return;
  }

  const style = doc.createElement("style");
  style.id = "jevfill-styles";
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      outline: 2px solid #22c55e !important;
      outline-offset: 2px;
    }
  `;
  doc.head.appendChild(style);
}

function highlightField(element: HTMLElement): void {
  ensureHighlightStyles(element.ownerDocument);
  element.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => {
    element.classList.remove(HIGHLIGHT_CLASS);
  }, HIGHLIGHT_DURATION_MS);
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  const setter = descriptor?.set;
  if (setter) {
    setter.call(element, value);
  } else {
    element.value = value;
  }
}

function fillSelect(element: HTMLSelectElement, value: string): boolean {
  for (const option of Array.from(element.options)) {
    if (option.value === value || option.text === value) {
      element.value = option.value;
      return true;
    }
  }
  return false;
}

export function fillField(element: HTMLElement, value: string): boolean {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element.disabled || element.readOnly) {
      return false;
    }
    setNativeValue(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    highlightField(element);
    return true;
  }

  if (element instanceof HTMLSelectElement) {
    if (element.disabled) {
      return false;
    }
    const filled = fillSelect(element, value);
    if (!filled) {
      return false;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    highlightField(element);
    return true;
  }

  return false;
}

export function applyMatches(
  elements: HTMLElement[],
  matches: FieldMatch[],
  lines: NoteLine[],
  threshold: number,
): number {
  const lineById = new Map(lines.map((line) => [line.id, line.text]));
  let filled = 0;

  for (const match of matches) {
    if (!match.lineId || match.confidence < threshold) {
      continue;
    }

    const value = lineById.get(match.lineId);
    if (!value) {
      continue;
    }

    const index = Number.parseInt(match.fieldId.replace("field_", ""), 10);
    const element = elements[index];
    if (!element) {
      continue;
    }

    if (fillField(element, value)) {
      filled += 1;
    }
  }

  return filled;
}
