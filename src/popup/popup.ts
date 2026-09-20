import autofillScript from "../content/autofill?script&iife";
import { debugError, debugLog } from "../debug";
import type { Message } from "../types";

const autofillBtn = document.querySelector<HTMLButtonElement>("#autofill-btn");
const statusEl = document.querySelector<HTMLParagraphElement>("#status");
const settingsLink = document.querySelector<HTMLAnchorElement>("#settings-link");

function setStatus(text: string, kind: "info" | "success" | "error" = "info"): void {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = text;
  statusEl.dataset.kind = kind;
}

function setLoading(loading: boolean): void {
  if (!autofillBtn) {
    return;
  }
  autofillBtn.disabled = loading;
  autofillBtn.textContent = loading ? "Filling…" : "Autofill page";
}

settingsLink?.addEventListener("click", (event) => {
  event.preventDefault();
  void chrome.runtime.openOptionsPage();
});

autofillBtn?.addEventListener("click", () => {
  void runAutofill();
});

async function runAutofill(): Promise<void> {
  setLoading(true);
  setStatus("Scanning page…", "info");
  // Popup logs: right-click the extension popup → Inspect.
  debugLog("Autofill started from popup");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    debugError("No active tab found");
    setLoading(false);
    setStatus("No active tab found", "error");
    return;
  }

  const tabId = tab.id;
  debugLog("Injecting content script", { tabId, url: tab.url });

  const listener = (message: Message) => {
    if (message.type === "AUTOFILL_RESULT") {
      debugLog("Autofill finished", message.payload);
      setLoading(false);
      setStatus(
        `Filled ${message.payload.filled} of ${message.payload.total} fields`,
        "success",
      );
      chrome.runtime.onMessage.removeListener(listener);
    }

    if (message.type === "AUTOFILL_ERROR") {
      debugError("Autofill failed", message.error);
      setLoading(false);
      setStatus(message.error, "error");
      chrome.runtime.onMessage.removeListener(listener);
    }
  };

  chrome.runtime.onMessage.addListener(listener);

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [autofillScript],
    });
    debugLog("Content script injected, waiting for result");
  } catch (error: unknown) {
    chrome.runtime.onMessage.removeListener(listener);
    setLoading(false);
    const errorMessage =
      error instanceof Error ? error.message : "Could not run autofill on this page";
    debugError("Failed to inject content script", errorMessage);
    setStatus(errorMessage, "error");
  }
}
