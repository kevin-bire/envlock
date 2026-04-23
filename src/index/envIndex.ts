import { EnvMap } from '../parser/envParser';

export interface IndexEntry {
  key: string;
  value: string;
  position: number;
}

export interface IndexResult {
  entries: IndexEntry[];
  keyMap: Map<string, IndexEntry>;
  total: number;
}

/**
 * Build a positional index from an EnvMap, preserving insertion order.
 */
export function buildIndex(env: EnvMap): IndexResult {
  const entries: IndexEntry[] = [];
  const keyMap = new Map<string, IndexEntry>();

  let position = 0;
  for (const [key, value] of Object.entries(env)) {
    const entry: IndexEntry = { key, value, position };
    entries.push(entry);
    keyMap.set(key, entry);
    position++;
  }

  return { entries, keyMap, total: entries.length };
}

/**
 * Look up a key in an index, returning the entry or undefined.
 */
export function lookupKey(index: IndexResult, key: string): IndexEntry | undefined {
  return index.keyMap.get(key);
}

/**
 * Return all keys in the index in positional order.
 */
export function getOrderedKeys(index: IndexResult): string[] {
  return index.entries.map((e) => e.key);
}

/**
 * Filter index entries by a predicate.
 */
export function filterIndex(
  index: IndexResult,
  predicate: (entry: IndexEntry) => boolean
): IndexEntry[] {
  return index.entries.filter(predicate);
}
