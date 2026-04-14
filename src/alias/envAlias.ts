import { EnvMap } from '../parser/envParser';

export interface AliasMap {
  [alias: string]: string;
}

export interface AliasResult {
  output: EnvMap;
  applied: { alias: string; original: string; value: string }[];
  missing: string[];
  conflicts: string[];
}

/**
 * Apply aliases to an env map.
 * For each alias -> original mapping, copy the value from original key to alias key.
 */
export function applyAliases(env: EnvMap, aliases: AliasMap): AliasResult {
  const output: EnvMap = { ...env };
  const applied: AliasResult['applied'] = [];
  const missing: string[] = [];
  const conflicts: string[] = [];

  for (const [alias, original] of Object.entries(aliases)) {
    if (!(original in env)) {
      missing.push(original);
      continue;
    }
    if (alias in env) {
      conflicts.push(alias);
      continue;
    }
    const value = env[original];
    output[alias] = value;
    applied.push({ alias, original, value });
  }

  return { output, applied, missing, conflicts };
}

/**
 * Build a reverse alias map: original -> alias[]
 */
export function buildReverseAliasMap(aliases: AliasMap): Record<string, string[]> {
  const reverse: Record<string, string[]> = {};
  for (const [alias, original] of Object.entries(aliases)) {
    if (!reverse[original]) reverse[original] = [];
    reverse[original].push(alias);
  }
  return reverse;
}

/**
 * Strip alias keys from an env map, keeping only originals.
 */
export function stripAliases(env: EnvMap, aliases: AliasMap): EnvMap {
  const aliasKeys = new Set(Object.keys(aliases));
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    if (!aliasKeys.has(key)) {
      result[key] = value;
    }
  }
  return result;
}
