import { EnvMap } from '../parser/envParser';

export interface OmitResult {
  original: EnvMap;
  result: EnvMap;
  omitted: string[];
  notFound: string[];
}

/**
 * Omit specific keys from an env map.
 */
export function omitKeys(env: EnvMap, keys: string[]): OmitResult {
  const omitted: string[] = [];
  const notFound: string[] = [];
  const result: EnvMap = { ...env };

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      delete result[key];
      omitted.push(key);
    } else {
      notFound.push(key);
    }
  }

  return { original: env, result, omitted, notFound };
}

/**
 * Omit keys matching any of the provided regex patterns.
 */
export function omitByPattern(env: EnvMap, patterns: string[]): OmitResult {
  const regexes = patterns.map((p) => new RegExp(p));
  const omitted: string[] = [];
  const result: EnvMap = {};

  for (const [key, value] of Object.entries(env)) {
    if (regexes.some((re) => re.test(key))) {
      omitted.push(key);
    } else {
      result[key] = value;
    }
  }

  return { original: env, result, omitted, notFound: [] };
}

/**
 * Unified omit entry point supporting keys and/or patterns.
 */
export function omitEnv(
  env: EnvMap,
  keys: string[] = [],
  patterns: string[] = []
): OmitResult {
  let combined: OmitResult = { original: env, result: { ...env }, omitted: [], notFound: [] };

  if (keys.length > 0) {
    const byKeys = omitKeys(combined.result, keys);
    combined.result = byKeys.result;
    combined.omitted.push(...byKeys.omitted);
    combined.notFound.push(...byKeys.notFound);
  }

  if (patterns.length > 0) {
    const byPattern = omitByPattern(combined.result, patterns);
    combined.result = byPattern.result;
    combined.omitted.push(...byPattern.omitted);
  }

  return combined;
}
