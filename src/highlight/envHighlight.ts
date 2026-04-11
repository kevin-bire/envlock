import { ParsedEnv } from '../parser/envParser';

export type HighlightCategory = 'secret' | 'url' | 'flag' | 'number' | 'empty' | 'default';

export interface HighlightedEntry {
  key: string;
  value: string;
  category: HighlightCategory;
}

export interface HighlightResult {
  entries: HighlightedEntry[];
  categoryCounts: Record<HighlightCategory, number>;
}

const SECRET_PATTERN = /secret|password|passwd|token|api_?key|private|auth|credential|cert|seed/i;
const URL_PATTERN = /^https?:\/\//i;
const FLAG_PATTERN = /^(true|false|yes|no|on|off|1|0)$/i;
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

export function categorize(key: string, value: string): HighlightCategory {
  if (SECRET_PATTERN.test(key)) return 'secret';
  if (value === '' || value === undefined) return 'empty';
  if (URL_PATTERN.test(value)) return 'url';
  if (FLAG_PATTERN.test(value)) return 'flag';
  if (NUMBER_PATTERN.test(value)) return 'number';
  return 'default';
}

export function highlightEnv(
  env: ParsedEnv,
  options: { maskSecrets?: boolean } = {}
): HighlightResult {
  const { maskSecrets = true } = options;

  const categoryCounts: Record<HighlightCategory, number> = {
    secret: 0,
    url: 0,
    flag: 0,
    number: 0,
    empty: 0,
    default: 0,
  };

  const entries: HighlightedEntry[] = Object.entries(env).map(([key, value]) => {
    const category = categorize(key, value);
    categoryCounts[category]++;
    const displayValue = maskSecrets && category === 'secret' ? '***' : value;
    return { key, value: displayValue, category };
  });

  return { entries, categoryCounts };
}
