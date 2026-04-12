import { EnvMap } from '../parser/envParser';
import { UniqueResult } from './uniqueFormatter';

/**
 * Finds keys whose values are shared by more than one key.
 * Returns a map of value -> list of keys that share it.
 */
export function findDuplicateValues(
  env: EnvMap
): Record<string, string[]> {
  const valueMap: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(env)) {
    if (!valueMap[value]) {
      valueMap[value] = [];
    }
    valueMap[value].push(key);
  }

  const duplicates: Record<string, string[]> = {};
  for (const [value, keys] of Object.entries(valueMap)) {
    if (keys.length > 1) {
      duplicates[value] = keys;
    }
  }

  return duplicates;
}

/**
 * Returns a new EnvMap keeping only the first occurrence of each unique value.
 * Keys are processed in insertion order.
 */
export function uniqueEnv(env: EnvMap): UniqueResult {
  const seen = new Set<string>();
  const unique: EnvMap = {};

  for (const [key, value] of Object.entries(env)) {
    if (!seen.has(value)) {
      seen.add(value);
      unique[key] = value;
    }
  }

  const duplicateValues = findDuplicateValues(env);

  return {
    original: env,
    unique,
    duplicateValues,
  };
}
