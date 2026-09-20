import { getSettings, saveSettings } from "../storage";
import { DEFAULT_CONFIDENCE_THRESHOLD } from "../types";

const notesEl = document.querySelector<HTMLTextAreaElement>("#notes");
const apiKeyEl = document.querySelector<HTMLInputElement>("#api-key");
const confidenceEl = document.querySelector<HTMLInputElement>("#confidence");
const confidenceValueEl = document.querySelector<HTMLSpanElement>("#confidence-value");
const saveBtn = document.querySelector<HTMLButtonElement>("#save-btn");
const statusEl = document.querySelector<HTMLParagraphElement>("#status");

function setStatus(text: string, kind: "info" | "success" | "error" = "info"): void {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = text;
  statusEl.dataset.kind = kind;
}

function updateConfidenceLabel(): void {
  if (!confidenceEl || !confidenceValueEl) {
    return;
  }
  confidenceValueEl.textContent = Number(confidenceEl.value).toFixed(2);
}

confidenceEl?.addEventListener("input", updateConfidenceLabel);

saveBtn?.addEventListener("click", () => {
  void save();
});

async function load(): Promise<void> {
  const settings = await getSettings();
  if (notesEl) notesEl.value = settings.notes;
  if (apiKeyEl) apiKeyEl.value = settings.apiKey ?? "";
  if (confidenceEl) {
    confidenceEl.value = String(settings.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD);
  }
  updateConfidenceLabel();
}

async function save(): Promise<void> {
  const notes = notesEl?.value ?? "";
  const apiKey = apiKeyEl?.value.trim() ?? "";
  const confidenceThreshold = Number(confidenceEl?.value ?? DEFAULT_CONFIDENCE_THRESHOLD);

  await saveSettings({
    notes,
    apiKey: apiKey || undefined,
    confidenceThreshold,
  });

  setStatus("Saved", "success");
}

void load();
