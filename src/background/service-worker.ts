import { debugError, debugLog, debugTimer } from "../debug";
import { classifyFields } from "../jev/client";
import { getSettings } from "../storage";
import type { ClassifyRequest, Message } from "../types";

debugLog("Service worker started");

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (message.type !== "CLASSIFY") {
    return false;
  }

  debugLog("CLASSIFY message received", {
    fieldCount: message.payload.fields.length,
    lineCount: message.payload.lines.length,
  });

  void handleClassify(message.payload)
    .then((matches) => {
      debugLog("Classification complete", { matchCount: matches.length });
      sendResponse({ type: "CLASSIFY_RESULT", payload: { matches } });
    })
    .catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Classification failed";
      debugError("Classification failed", errorMessage);
      sendResponse({ type: "CLASSIFY_ERROR", error: errorMessage });
    });

  return true;
});

async function handleClassify(payload: ClassifyRequest) {
  const settings = await getSettings();

  if (!settings.apiKey) {
    throw new Error("Add your Jev API key in extension settings");
  }

  const endClassify = debugTimer("Jev API call");
  const matches = await classifyFields(settings.apiKey, payload.fields, payload.lines);
  endClassify();
  return matches;
}
