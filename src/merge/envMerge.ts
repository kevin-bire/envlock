import { ParsedEnv } from '../parser/envParser';

export type MergeStrategy = 'base-wins' | 'override-wins' | 'prompt';

export interface MergeResult {
  merged: ParsedEnv;
  conflicts: MergeConflict[];
  added: string[];
  overridden: string[];
}

export interface MergeConflict {
  key: string;
  baseValue: string;
  overrideValue: string;
}

/**
 * Merges two ParsedEnv objects together.
 * @param base - The base environment (lower priority)
 * @param override - The override environment (higher priority by default)
 * @param strategy - How to resolve conflicts
 */
export function mergeEnvs(
  base: ParsedEnv,
  override: ParsedEnv,
  strategy: MergeStrategy = 'override-wins'
): MergeResult {
  const merged: ParsedEnv = { ...base };
  const conflicts: MergeConflict[] = [];
  const added: string[] = [];
  const overridden: string[] = [];

  for (const [key, overrideValue] of Object.entries(override)) {
    if (!(key in base)) {
      merged[key] = overrideValue;
      added.push(key);
    } else if (base[key] !== overrideValue) {
      conflicts.push({
        key,
        baseValue: base[key],
        overrideValue,
      });

      if (strategy === 'override-wins') {
        merged[key] = overrideValue;
        overridden.push(key);
      }
      // 'base-wins' keeps the base value (already set via spread)
      // 'prompt' leaves base value; caller must resolve conflicts manually
    }
  }

  return { merged, conflicts, added, overridden };
}

/**
 * Returns keys present in override but missing in base.
 */
export function getMissingKeys(base: ParsedEnv, override: ParsedEnv): string[] {
  return Object.keys(override).filter((key) => !(key in base));
}
