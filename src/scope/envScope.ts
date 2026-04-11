import { ParsedEnv } from '../parser/envParser';

export interface ScopeOptions {
  scopes: string[];
  separator?: string;
}

export interface ScopeResult {
  scoped: ParsedEnv;
  unscoped: ParsedEnv;
  matched: string[];
  unmatched: string[];
}

/**
 * Filter env entries that belong to any of the given scopes.
 * A scoped key looks like: SCOPE__KEY or SCOPE_KEY depending on separator.
 */
export function filterByScope(
  env: ParsedEnv,
  scopes: string[],
  separator = '__'
): ScopeResult {
  const scoped: ParsedEnv = {};
  const unscoped: ParsedEnv = {};
  const matched: string[] = [];
  const unmatched: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const belongsToScope = scopes.some((scope) =>
      key.startsWith(`${scope.toUpperCase()}${separator}`)
    );

    if (belongsToScope) {
      scoped[key] = value;
      matched.push(key);
    } else {
      unscoped[key] = value;
      unmatched.push(key);
    }
  }

  return { scoped, unscoped, matched, unmatched };
}

/**
 * Strip the scope prefix from all keys in a scoped env map.
 */
export function stripScopePrefix(
  env: ParsedEnv,
  scope: string,
  separator = '__'
): ParsedEnv {
  const prefix = `${scope.toUpperCase()}${separator}`;
  const result: ParsedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Add a scope prefix to all keys in an env map.
 */
export function addScopePrefix(
  env: ParsedEnv,
  scope: string,
  separator = '__'
): ParsedEnv {
  const prefix = `${scope.toUpperCase()}${separator}`;
  const result: ParsedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    result[`${prefix}${key}`] = value;
  }

  return result;
}
