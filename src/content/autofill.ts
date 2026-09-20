import { debugError, debugLog, debugTimer } from "../debug";
import { applyMatches } from "../field-filler";
import { getFillableElements, scanFields } from "../field-scanner";
import { getSettings } from "../storage";
import { splitNotesToLines } from "../splitter";
import { DEFAULT_CONFIDENCE_THRESHOLD, type Message } from "../types";

async function runAutofill(): Promise<void> {
  debugLog("Content script started", { url: window.location.href });

  try {
    const settings = await getSettings();
    debugLog("Settings loaded", {
      hasNotes: Boolean(settings.notes.trim()),
      hasApiKey: Boolean(settings.apiKey),
      confidenceThreshold: settings.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD,
    });

    if (!settings.notes.trim()) {
      throw new Error("Add your notes in extension settings");
    }

    if (!settings.apiKey) {
      throw new Error("Add your Jev API key in extension settings");
    }

    const endScan = debugTimer("Field scan");
    const fields = scanFields();
    const elements = getFillableElements();
    endScan();
    debugLog("Fields scanned", { fillable: fields.length });

    if (fields.length === 0) {
      throw new Error("No fillable fields found on this page");
    }

    const lines = splitNotesToLines(settings.notes);
    debugLog("Notes split into lines", { lineCount: lines.length });
    if (lines.length === 0) {
      throw new Error("Your notes are empty after splitting");
    }

    debugLog("Sending CLASSIFY message to background");
    const endClassify = debugTimer("Classification");
    const response = await chrome.runtime.sendMessage<Message, Message>({
      type: "CLASSIFY",
      payload: { fields, lines },
    });
    endClassify();

    if (!response) {
      throw new Error("No response from extension background");
    }

    if (response.type === "CLASSIFY_ERROR") {
      throw new Error(response.error);
    }

    if (response.type !== "CLASSIFY_RESULT") {
      throw new Error("Unexpected response from extension background");
    }

    debugLog("Classification result received", {
      matchCount: response.payload.matches.length,
    });

    const threshold = settings.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
    const filled = applyMatches(
      elements,
      response.payload.matches,
      lines,
      threshold,
    );

    debugLog("Fields filled", { filled, total: fields.length, threshold });

    await chrome.runtime.sendMessage<Message>({
      type: "AUTOFILL_RESULT",
      payload: { filled, total: fields.length },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Autofill failed";
    debugError("Content script error", errorMessage);
    await chrome.runtime.sendMessage<Message>({
      type: "AUTOFILL_ERROR",
      error: errorMessage,
    });
  }
}

void runAutofill();
