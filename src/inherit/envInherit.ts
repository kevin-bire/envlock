import { ParsedEnv } from '../parser/envParser';

export interface InheritResult {
  base: string;
  override: string;
  merged: ParsedEnv;
  inherited: string[];
  overridden: string[];
  added: string[];
}

/**
 * Merges a base env into an override env, inheriting missing keys.
 * Keys present in override take precedence over base.
 */
export function inheritEnv(
  base: ParsedEnv,
  override: ParsedEnv,
  baseName = 'base',
  overrideName = 'override'
): InheritResult {
  const merged: ParsedEnv = { ...base };
  const inherited: string[] = [];
  const overridden: string[] = [];
  const added: string[] = [];

  for (const [key, value] of Object.entries(override)) {
    if (key in base) {
      if (base[key] !== value) {
        overridden.push(key);
      }
      merged[key] = value;
    } else {
      added.push(key);
      merged[key] = value;
    }
  }

  for (const key of Object.keys(base)) {
    if (!(key in override)) {
      inherited.push(key);
    }
  }

  return {
    base: baseName,
    override: overrideName,
    merged,
    inherited,
    overridden,
    added,
  };
}

/**
 * Returns keys present in base but missing from override (candidates for inheritance).
 */
export function getMissingInherited(
  base: ParsedEnv,
  override: ParsedEnv
): string[] {
  return Object.keys(base).filter((k) => !(k in override));
}
