import { ParsedEnv } from '../parser/envParser';

export interface CopyOptions {
  keys: string[];
  overwrite?: boolean;
}

export interface CopyResult {
  copied: { key: string; value: string }[];
  skipped: { key: string; reason: string }[];
  target: ParsedEnv;
}

export function copyKeys(
  source: ParsedEnv,
  target: ParsedEnv,
  options: CopyOptions
): CopyResult {
  const copied: { key: string; value: string }[] = [];
  const skipped: { key: string; reason: string }[] = [];
  const result: ParsedEnv = { ...target };

  for (const key of options.keys) {
    if (!(key in source)) {
      skipped.push({ key, reason: 'not found in source' });
      continue;
    }
    if (key in target && !options.overwrite) {
      skipped.push({ key, reason: 'already exists in target' });
      continue;
    }
    result[key] = source[key];
    copied.push({ key, value: source[key] });
  }

  return { copied, skipped, target: result };
}

export function copyAllMissing(
  source: ParsedEnv,
  target: ParsedEnv
): CopyResult {
  const missingKeys = Object.keys(source).filter((k) => !(k in target));
  return copyKeys(source, target, { keys: missingKeys, overwrite: false });
}
