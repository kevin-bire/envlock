import { ParsedEnv } from '../parser/envParser';

export interface PlaceholderResult {
  filled: ParsedEnv;
  replaced: string[];
  skipped: string[];
  missing: string[];
}

export interface PlaceholderOptions {
  prefix?: string;
  suffix?: string;
  overwrite?: boolean;
}

const DEFAULT_PREFIX = '{{';
const DEFAULT_SUFFIX = '}}';

export function detectPlaceholders(
  env: ParsedEnv,
  prefix = DEFAULT_PREFIX,
  suffix = DEFAULT_SUFFIX
): string[] {
  const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped(prefix)}([^${escaped(suffix)}]+)${escaped(suffix)}`);
  return Object.entries(env)
    .filter(([, v]) => pattern.test(v))
    .map(([k]) => k);
}

export function fillPlaceholders(
  env: ParsedEnv,
  values: ParsedEnv,
  options: PlaceholderOptions = {}
): PlaceholderResult {
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const suffix = options.suffix ?? DEFAULT_SUFFIX;
  const overwrite = options.overwrite ?? true;

  const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped(prefix)}([^${escaped(suffix)}]+)${escaped(suffix)}`, 'g');

  const filled: ParsedEnv = { ...env };
  const replaced: string[] = [];
  const skipped: string[] = [];
  const missing: string[] = [];

  for (const [key, val] of Object.entries(env)) {
    const matches = [...val.matchAll(pattern)];
    if (matches.length === 0) continue;

    let newVal = val;
    let hasMissing = false;

    for (const match of matches) {
      const placeholder = match[1].trim();
      if (placeholder in values) {
        if (!overwrite && filled[key] !== val) {
          skipped.push(key);
          continue;
        }
        newVal = newVal.replace(match[0], values[placeholder]);
      } else {
        hasMissing = true;
        if (!missing.includes(placeholder)) missing.push(placeholder);
      }
    }

    if (!hasMissing && newVal !== val) {
      filled[key] = newVal;
      replaced.push(key);
    } else if (hasMissing) {
      skipped.push(key);
    }
  }

  return { filled, replaced, skipped, missing };
}
