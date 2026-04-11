import { ParsedEnv } from '../parser/envParser';

export interface DefaultEntry {
  key: string;
  value: string;
  applied: boolean;
}

export interface DefaultsResult {
  env: ParsedEnv;
  applied: DefaultEntry[];
  skipped: DefaultEntry[];
}

/**
 * Apply default values to an env object for keys that are missing or empty.
 * @param env - The source parsed env
 * @param defaults - A map of key -> default value
 * @param overwriteEmpty - If true, also overwrite keys that exist but have empty string values
 */
export function applyDefaults(
  env: ParsedEnv,
  defaults: Record<string, string>,
  overwriteEmpty = false
): DefaultsResult {
  const result: ParsedEnv = { ...env };
  const applied: DefaultEntry[] = [];
  const skipped: DefaultEntry[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    const existing = result[key];
    const isMissing = existing === undefined;
    const isEmpty = existing === '';

    if (isMissing || (overwriteEmpty && isEmpty)) {
      result[key] = value;
      applied.push({ key, value, applied: true });
    } else {
      skipped.push({ key, value, applied: false });
    }
  }

  return { env: result, applied, skipped };
}

/**
 * Extract keys from env that have no value (undefined or empty string).
 */
export function getMissingDefaults(
  env: ParsedEnv,
  defaults: Record<string, string>
): string[] {
  return Object.keys(defaults).filter(
    (key) => env[key] === undefined || env[key] === ''
  );
}
