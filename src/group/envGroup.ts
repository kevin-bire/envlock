import { ParsedEnv } from '../parser/envParser';

export interface GroupResult {
  groups: Record<string, Record<string, string>>;
  ungrouped: Record<string, string>;
  totalKeys: number;
  totalGroups: number;
}

/**
 * Groups env entries by their prefix (e.g. DB_HOST -> group 'DB').
 * Keys without an underscore are placed in 'ungrouped'.
 */
export function groupByPrefix(
  env: ParsedEnv,
  delimiter: string = '_'
): GroupResult {
  const groups: Record<string, Record<string, string>> = {};
  const ungrouped: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const delimIndex = key.indexOf(delimiter);
    if (delimIndex > 0) {
      const prefix = key.substring(0, delimIndex);
      if (!groups[prefix]) {
        groups[prefix] = {};
      }
      groups[prefix][key] = value;
    } else {
      ungrouped[key] = value;
    }
  }

  return {
    groups,
    ungrouped,
    totalKeys: Object.keys(env).length,
    totalGroups: Object.keys(groups).length,
  };
}

/**
 * Filters a GroupResult to only include specified group names.
 */
export function filterGroups(
  result: GroupResult,
  names: string[]
): GroupResult {
  const filtered: Record<string, Record<string, string>> = {};
  let totalKeys = Object.keys(result.ungrouped).length;

  for (const name of names) {
    if (result.groups[name]) {
      filtered[name] = result.groups[name];
      totalKeys += Object.keys(filtered[name]).length;
    }
  }

  return {
    groups: filtered,
    ungrouped: result.ungrouped,
    totalKeys,
    totalGroups: Object.keys(filtered).length,
  };
}
