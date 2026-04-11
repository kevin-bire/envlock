import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../parser/envParser';

export interface PinEntry {
  key: string;
  value: string;
  pinnedAt: string;
  file: string;
}

export interface PinResult {
  pinned: PinEntry[];
  alreadyPinned: string[];
  notFound: string[];
}

export interface PinStore {
  version: number;
  entries: PinEntry[];
}

export function loadPinStore(pinFile: string): PinStore {
  if (!fs.existsSync(pinFile)) {
    return { version: 1, entries: [] };
  }
  const raw = fs.readFileSync(pinFile, 'utf-8');
  return JSON.parse(raw) as PinStore;
}

export function savePinStore(pinFile: string, store: PinStore): void {
  fs.writeFileSync(pinFile, JSON.stringify(store, null, 2), 'utf-8');
}

export function pinKeys(
  envFile: string,
  keys: string[],
  pinFile: string
): PinResult {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  const parsed = parseEnv(envContent);
  const store = loadPinStore(pinFile);

  const result: PinResult = { pinned: [], alreadyPinned: [], notFound: [] };
  const existingKeys = new Set(store.entries.map((e) => e.key));

  for (const key of keys) {
    if (!(key in parsed)) {
      result.notFound.push(key);
      continue;
    }
    if (existingKeys.has(key)) {
      result.alreadyPinned.push(key);
      continue;
    }
    const entry: PinEntry = {
      key,
      value: parsed[key],
      pinnedAt: new Date().toISOString(),
      file: path.resolve(envFile),
    };
    store.entries.push(entry);
    result.pinned.push(entry);
  }

  savePinStore(pinFile, store);
  return result;
}

export function unpinKeys(keys: string[], pinFile: string): string[] {
  const store = loadPinStore(pinFile);
  const removed: string[] = [];
  store.entries = store.entries.filter((e) => {
    if (keys.includes(e.key)) {
      removed.push(e.key);
      return false;
    }
    return true;
  });
  savePinStore(pinFile, store);
  return removed;
}

export function checkPins(
  envFile: string,
  pinFile: string
): { key: string; expected: string; actual: string | undefined }[] {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  const parsed = parseEnv(envContent);
  const store = loadPinStore(pinFile);
  return store.entries
    .filter((e) => path.resolve(envFile) === e.file)
    .filter((e) => parsed[e.key] !== e.value)
    .map((e) => ({ key: e.key, expected: e.value, actual: parsed[e.key] }));
}
