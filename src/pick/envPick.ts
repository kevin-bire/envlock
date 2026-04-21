import { EnvMap } from '../parser/envParser';

export interface PickResult {
  picked: EnvMap;
  missing: string[];
  total: number;
}

/**
 * Pick specific keys from an env map.
 * Returns picked entries and tracks which requested keys were missing.
 */
export function pickKeys(env: EnvMap, keys: string[]): PickResult {
  const picked: EnvMap = {};
  const missing: string[] = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      picked[key] = env[key];
    } else {
      missing.push(key);
    }
  }

  return {
    picked,
    missing,
    total: Object.keys(picked).length,
  };
}

/**
 * Pick keys from an env map that match a given pattern (glob-style prefix or regex string).
 */
export function pickByPattern(env: EnvMap, pattern: string): PickResult {
  const regex = new RegExp(pattern);
  const picked: EnvMap = {};

  for (const [key, value] of Object.entries(env)) {
    if (regex.test(key)) {
      picked[key] = value;
    }
  }

  return {
    picked,
    missing: [],
    total: Object.keys(picked).length,
  };
}

/**
 * Main entry: pick by explicit keys or by pattern.
 */
export function pickEnv(
  env: EnvMap,
  keys: string[],
  pattern?: string
): PickResult {
  if (pattern) {
    return pickByPattern(env, pattern);
  }
  return pickKeys(env, keys);
}
