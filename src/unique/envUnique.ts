import { ParsedEnv } from '../parser/envParser';

export interface UniqueResult {
  unique: ParsedEnv;
  duplicateValues: DuplicateValueEntry[];
  totalKeys: number;
  uniqueCount: number;
  duplicateCount: number;
}

export interface DuplicateValueEntry {
  value: string;
  keys: string[];
}

/**
 * Finds keys that share the same value.
 */
export function findDuplicateValues(env: ParsedEnv): DuplicateValueEntry[] {
  const valueMap = new Map<string, string[]>();

  for (const [key, value] of Object.entries(env)) {
    const existing = valueMap.get(value) ?? [];
    existing.push(key);
    valueMap.set(value, existing);
  }

  const duplicates: DuplicateValueEntry[] = [];
  for (const [value, keys] of valueMap.entries()) {
    if (keys.length > 1) {
      duplicates.push({ value, keys });
    }
  }

  return duplicates;
}

/**
 * Returns only keys with unique values (no other key shares the same value).
 */
export function uniqueEnv(env: ParsedEnv): UniqueResult {
  const duplicates = findDuplicateValues(env);
  const duplicateKeys = new Set(duplicates.flatMap((d) => d.keys.slice(1)));

  const unique: ParsedEnv = {};
  for (const [key, value] of Object.entries(env)) {
    if (!duplicateKeys.has(key)) {
      unique[key] = value;
    }
  }

  return {
    unique,
    duplicateValues: duplicates,
    totalKeys: Object.keys(env).length,
    uniqueCount: Object.keys(unique).length,
    duplicateCount: duplicateKeys.size,
  };
}
