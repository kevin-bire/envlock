import { ParsedEnv } from '../parser/envParser';

export type FilterMode = 'include' | 'exclude';

export interface FilterOptions {
  keys?: string[];
  pattern?: string;
  mode: FilterMode;
}

export interface FilterResult {
  filtered: ParsedEnv;
  matched: string[];
  unmatched: string[];
}

export function filterByKeys(
  env: ParsedEnv,
  keys: string[],
  mode: FilterMode
): FilterResult {
  const keySet = new Set(keys);
  const matched: string[] = [];
  const unmatched: string[] = [];
  const filtered: ParsedEnv = {};

  for (const key of Object.keys(env)) {
    const isMatch = keySet.has(key);
    if (isMatch) matched.push(key);
    else unmatched.push(key);

    if ((mode === 'include' && isMatch) || (mode === 'exclude' && !isMatch)) {
      filtered[key] = env[key];
    }
  }

  return { filtered, matched, unmatched };
}

export function filterByPattern(
  env: ParsedEnv,
  pattern: string,
  mode: FilterMode
): FilterResult {
  const regex = new RegExp(pattern);
  const matched: string[] = [];
  const unmatched: string[] = [];
  const filtered: ParsedEnv = {};

  for (const key of Object.keys(env)) {
    const isMatch = regex.test(key);
    if (isMatch) matched.push(key);
    else unmatched.push(key);

    if ((mode === 'include' && isMatch) || (mode === 'exclude' && !isMatch)) {
      filtered[key] = env[key];
    }
  }

  return { filtered, matched, unmatched };
}

export function filterEnv(
  env: ParsedEnv,
  options: FilterOptions
): FilterResult {
  if (options.pattern) {
    return filterByPattern(env, options.pattern, options.mode);
  }
  if (options.keys && options.keys.length > 0) {
    return filterByKeys(env, options.keys, options.mode);
  }
  return { filtered: { ...env }, matched: [], unmatched: Object.keys(env) };
}
