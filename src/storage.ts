import { DEFAULT_CONFIDENCE_THRESHOLD, type StorageData } from "./types";

const STORAGE_KEYS = ["notes", "apiKey", "confidenceThreshold"] as const;

export async function getSettings(): Promise<StorageData> {
  const result = await chrome.storage.local.get(STORAGE_KEYS);
  return {
    notes: typeof result.notes === "string" ? result.notes : "",
    apiKey: typeof result.apiKey === "string" ? result.apiKey : undefined,
    confidenceThreshold:
      typeof result.confidenceThreshold === "number"
        ? result.confidenceThreshold
        : DEFAULT_CONFIDENCE_THRESHOLD,
  };
}

export async function saveSettings(data: Partial<StorageData>): Promise<void> {
  await chrome.storage.local.set(data);
}
