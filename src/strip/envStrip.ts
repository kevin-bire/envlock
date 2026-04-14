import { ParsedEnv } from '../parser/envParser';

export interface StripOptions {
  keys?: string[];
  patterns?: RegExp[];
  emptyValues?: boolean;
  comments?: boolean;
}

export interface StripResult {
  original: ParsedEnv;
  stripped: ParsedEnv;
  removedKeys: string[];
  removedCount: number;
}

export function stripByKeys(env: ParsedEnv, keys: string[]): string[] {
  const keySet = new Set(keys.map(k => k.toUpperCase()));
  return Object.keys(env).filter(k => keySet.has(k.toUpperCase()));
}

export function stripByPatterns(env: ParsedEnv, patterns: RegExp[]): string[] {
  return Object.keys(env).filter(key =>
    patterns.some(pattern => pattern.test(key))
  );
}

export function stripEmptyValues(env: ParsedEnv): string[] {
  return Object.keys(env).filter(key => {
    const val = env[key];
    return val === '' || val === null || val === undefined;
  });
}

export function stripEnv(env: ParsedEnv, options: StripOptions = {}): StripResult {
  const { keys = [], patterns = [], emptyValues = false } = options;

  const toRemove = new Set<string>();

  if (keys.length > 0) {
    stripByKeys(env, keys).forEach(k => toRemove.add(k));
  }

  if (patterns.length > 0) {
    stripByPatterns(env, patterns).forEach(k => toRemove.add(k));
  }

  if (emptyValues) {
    stripEmptyValues(env).forEach(k => toRemove.add(k));
  }

  const stripped: ParsedEnv = {};
  for (const key of Object.keys(env)) {
    if (!toRemove.has(key)) {
      stripped[key] = env[key];
    }
  }

  return {
    original: env,
    stripped,
    removedKeys: Array.from(toRemove),
    removedCount: toRemove.size,
  };
}
