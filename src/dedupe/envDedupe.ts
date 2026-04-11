import { ParsedEnv } from '../parser/envParser';

export interface DedupeResult {
  deduped: ParsedEnv;
  duplicates: DuplicateEntry[];
  totalRemoved: number;
}

export interface DuplicateEntry {
  key: string;
  occurrences: number;
  keptValue: string;
  removedValues: string[];
}

/**
 * Finds all duplicate keys in a parsed env object.
 * Returns keys that appear more than once in the raw entries.
 */
export function findDuplicates(entries: Array<{ key: string; value: string }>): DuplicateEntry[] {
  const seen = new Map<string, string[]>();

  for (const { key, value } of entries) {
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(value);
  }

  const duplicates: DuplicateEntry[] = [];
  for (const [key, values] of seen.entries()) {
    if (values.length > 1) {
      duplicates.push({
        key,
        occurrences: values.length,
        keptValue: values[values.length - 1],
        removedValues: values.slice(0, -1),
      });
    }
  }

  return duplicates;
}

/**
 * Deduplicates a ParsedEnv by keeping the last occurrence of each key.
 */
export function dedupeEnv(
  entries: Array<{ key: string; value: string }>,
  env: ParsedEnv
): DedupeResult {
  const duplicates = findDuplicates(entries);
  const totalRemoved = duplicates.reduce((sum, d) => sum + d.occurrences - 1, 0);

  // env already holds last-wins values from parser; just return as-is
  const deduped: ParsedEnv = { ...env };

  return { deduped, duplicates, totalRemoved };
}
