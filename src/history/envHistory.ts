import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../parser/envParser';

export interface HistoryEntry {
  timestamp: string;
  file: string;
  checksum: string;
  keys: string[];
  snapshot: Record<string, string>;
}

export interface HistoryStore {
  entries: HistoryEntry[];
}

export function computeSimpleChecksum(env: Record<string, string>): string {
  const sorted = Object.keys(env).sort().map(k => `${k}=${env[k]}`).join('\n');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = (hash << 5) - hash + sorted.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function loadHistory(historyPath: string): HistoryStore {
  if (!fs.existsSync(historyPath)) {
    return { entries: [] };
  }
  const raw = fs.readFileSync(historyPath, 'utf-8');
  return JSON.parse(raw) as HistoryStore;
}

export function saveHistory(historyPath: string, store: HistoryStore): void {
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify(store, null, 2), 'utf-8');
}

export function recordHistory(
  envFile: string,
  historyPath: string,
  maxEntries = 20
): HistoryEntry {
  const content = fs.readFileSync(envFile, 'utf-8');
  const env = parseEnv(content);
  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    file: envFile,
    checksum: computeSimpleChecksum(env),
    keys: Object.keys(env).sort(),
    snapshot: env,
  };
  const store = loadHistory(historyPath);
  store.entries.unshift(entry);
  if (store.entries.length > maxEntries) {
    store.entries = store.entries.slice(0, maxEntries);
  }
  saveHistory(historyPath, store);
  return entry;
}

export function getHistory(historyPath: string, limit?: number): HistoryEntry[] {
  const store = loadHistory(historyPath);
  return limit ? store.entries.slice(0, limit) : store.entries;
}
