import type { FieldContext, ScannedField } from "./types";

function isExcluded(element: HTMLElement): boolean {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    return false;
  }

  const inputType = (element.getAttribute("type") ?? "text").toLowerCase();
  if (inputType === "password" || inputType === "hidden") {
    return true;
  }

  const autocomplete = (element.getAttribute("autocomplete") ?? "").toLowerCase();
  if (autocomplete.includes("cc-")) {
    return true;
  }

  return false;
}

function isFillable(element: HTMLElement): boolean {
  if (element instanceof HTMLSelectElement) {
    return !element.disabled;
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element.disabled || element.readOnly) {
      return false;
    }
    return !isExcluded(element);
  }

  return false;
}

function getFieldDescription(element: HTMLElement): string | undefined {
  const parent = element.parentElement;
  if (!parent) {
    return undefined;
  }

  const chunks: string[] = [];

  for (const node of parent.childNodes) {
    if (node === element) {
      break;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        chunks.push(text);
      }
      continue;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const text = (node as HTMLElement).textContent?.trim();
      if (text) {
        chunks.push(text);
      }
    }
  }

  const combined = chunks.join(" ").trim();
  return combined || undefined;
}

function buildContext(element: HTMLElement, fieldId: string): FieldContext {
  const context: FieldContext = {
    fieldId,
    tagName: element.tagName.toLowerCase(),
  };

  const name = element.getAttribute("name");
  const id = element.getAttribute("id");
  const placeholder = element.getAttribute("placeholder");
  const ariaLabel = element.getAttribute("aria-label");
  const description = getFieldDescription(element);

  if (name) context.name = name;
  if (id) context.id = id;
  if (placeholder) context.placeholder = placeholder;
  if (ariaLabel) context.ariaLabel = ariaLabel;
  if (description) context.description = description;

  if (element instanceof HTMLInputElement) {
    context.inputType = element.type || "text";
  }

  return context;
}

export function scanFields(root: ParentNode = document): ScannedField[] {
  const elements = Array.from(
    root.querySelectorAll<HTMLElement>("input, select, textarea"),
  ).filter(isFillable);

  return elements.map((element, index) => {
    const fieldId = `field_${index}`;
    return {
      fieldId,
      context: buildContext(element, fieldId),
    };
  });
}

export function getFillableElements(root: ParentNode = document): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("input, select, textarea"),
  ).filter(isFillable);
}
