import { ParsedEnv } from '../parser/envParser';

export interface PromoteOptions {
  overwrite?: boolean;
  dryRun?: boolean;
  keys?: string[];
}

export interface PromoteResult {
  promoted: Array<{ key: string; fromValue: string; toValue: string | undefined }>;
  skipped: Array<{ key: string; reason: string }>;
  dryRun: boolean;
}

export function promoteEnv(
  source: ParsedEnv,
  target: ParsedEnv,
  options: PromoteOptions = {}
): PromoteResult {
  const { overwrite = false, dryRun = false, keys } = options;
  const promoted: PromoteResult['promoted'] = [];
  const skipped: PromoteResult['skipped'] = [];

  const keysToPromote = keys ?? Object.keys(source);

  for (const key of keysToPromote) {
    if (!(key in source)) {
      skipped.push({ key, reason: 'key not found in source' });
      continue;
    }

    const existsInTarget = key in target;

    if (existsInTarget && !overwrite) {
      skipped.push({ key, reason: 'key already exists in target (use --overwrite to replace)' });
      continue;
    }

    promoted.push({
      key,
      fromValue: source[key],
      toValue: target[key],
    });

    if (!dryRun) {
      target[key] = source[key];
    }
  }

  return { promoted, skipped, dryRun };
}

export function getMissingInTarget(source: ParsedEnv, target: ParsedEnv): string[] {
  return Object.keys(source).filter((key) => !(key in target));
}
