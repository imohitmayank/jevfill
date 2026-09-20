const PREFIX = "[jevfill]";

function write(level: "log" | "warn" | "error", message: string, data?: unknown): void {
  const line = `${PREFIX} ${message}`;
  if (data !== undefined) {
    console[level](line, data);
  } else {
    console[level](line);
  }
}

export function debugLog(message: string, data?: unknown): void {
  write("log", message, data);
}

export function debugWarn(message: string, data?: unknown): void {
  write("warn", message, data);
}

export function debugError(message: string, data?: unknown): void {
  write("error", message, data);
}

export function debugTimer(label: string): () => void {
  const start = performance.now();
  return () => {
    debugLog(`${label} (${Math.round(performance.now() - start)}ms)`);
  };
}
