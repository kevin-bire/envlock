import { ParsedEnv } from '../parser/envParser';

export interface PrefixResult {
  updated: Record<string, { oldKey: string; newKey: string; value: string }>;
  skipped: string[];
  env: ParsedEnv;
}

export function addPrefix(env: ParsedEnv, prefix: string): PrefixResult {
  const updated: PrefixResult['updated'] = {};
  const skipped: string[] = [];
  const result: ParsedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      skipped.push(key);
      result[key] = value;
    } else {
      const newKey = `${prefix}${key}`;
      updated[newKey] = { oldKey: key, newKey, value };
      result[newKey] = value;
    }
  }

  return { updated, skipped, env: result };
}

export function removePrefix(env: ParsedEnv, prefix: string): PrefixResult {
  const updated: PrefixResult['updated'] = {};
  const skipped: string[] = [];
  const result: ParsedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      const newKey = key.slice(prefix.length);
      updated[key] = { oldKey: key, newKey, value };
      result[newKey] = value;
    } else {
      skipped.push(key);
      result[key] = value;
    }
  }

  return { updated, skipped, env: result };
}
