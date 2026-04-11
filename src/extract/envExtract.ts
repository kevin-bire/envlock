import { ParsedEnv } from '../parser/envParser';

export interface ExtractOptions {
  keys: string[];
  strict?: boolean;
}

export interface ExtractResult {
  extracted: ParsedEnv;
  found: string[];
  missing: string[];
}

/**
 * Extracts a subset of keys from a parsed env object.
 */
export function extractEnv(
  env: ParsedEnv,
  options: ExtractOptions
): ExtractResult {
  const { keys, strict = false } = options;
  const extracted: ParsedEnv = {};
  const found: string[] = [];
  const missing: string[] = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      extracted[key] = env[key];
      found.push(key);
    } else {
      missing.push(key);
      if (strict) {
        throw new Error(`Key "${key}" not found in env (strict mode)`);
      }
    }
  }

  return { extracted, found, missing };
}

/**
 * Extracts keys matching a given regex pattern.
 */
export function extractByPattern(
  env: ParsedEnv,
  pattern: RegExp
): ExtractResult {
  const extracted: ParsedEnv = {};
  const found: string[] = [];
  const missing: string[] = [];

  for (const key of Object.keys(env)) {
    if (pattern.test(key)) {
      extracted[key] = env[key];
      found.push(key);
    }
  }

  return { extracted, found, missing };
}
