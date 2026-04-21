export interface TruncateOptions {
  maxLength: number;
  suffix?: string;
  keys?: string[];
  pattern?: RegExp;
}

export interface TruncateChange {
  key: string;
  original: string;
  truncated: string;
}

export interface TruncateResult {
  env: Record<string, string>;
  changes: TruncateChange[];
  skipped: string[];
}

export function shouldTruncate(
  key: string,
  keys?: string[],
  pattern?: RegExp
): boolean {
  if (!keys && !pattern) return true;
  if (keys && keys.includes(key)) return true;
  if (pattern && pattern.test(key)) return true;
  return false;
}

export function truncateValue(
  value: string,
  maxLength: number,
  suffix = '...'
): string {
  if (value.length <= maxLength) return value;
  const cutAt = Math.max(0, maxLength - suffix.length);
  return value.slice(0, cutAt) + suffix;
}

export function truncateEnv(
  env: Record<string, string>,
  options: TruncateOptions
): TruncateResult {
  const { maxLength, suffix = '...', keys, pattern } = options;
  const result: Record<string, string> = {};
  const changes: TruncateChange[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (!shouldTruncate(key, keys, pattern)) {
      result[key] = value;
      skipped.push(key);
      continue;
    }

    const truncated = truncateValue(value, maxLength, suffix);

    if (truncated !== value) {
      changes.push({ key, original: value, truncated });
    }

    result[key] = truncated;
  }

  return { env: result, changes, skipped };
}
