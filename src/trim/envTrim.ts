import { ParsedEnv } from '../parser/envParser';

export interface TrimResult {
  trimmed: ParsedEnv;
  changes: TrimChange[];
  totalTrimmed: number;
}

export interface TrimChange {
  key: string;
  before: string;
  after: string;
  type: 'leading' | 'trailing' | 'both' | 'quotes';
}

export function trimValue(value: string): { value: string; type: TrimChange['type'] | null } {
  const stripped = stripQuotes(value);
  const trimmed = stripped.trim();

  const hadLeading = stripped !== stripped.trimStart();
  const hadTrailing = stripped !== stripped.trimEnd();
  const hadQuotes = stripped !== value;

  if (hadQuotes) return { value: trimmed, type: 'quotes' };
  if (hadLeading && hadTrailing) return { value: trimmed, type: 'both' };
  if (hadLeading) return { value: trimmed, type: 'leading' };
  if (hadTrailing) return { value: trimmed, type: 'trailing' };

  return { value: trimmed, type: null };
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function trimEnv(env: ParsedEnv, keys?: string[]): TrimResult {
  const trimmed: ParsedEnv = {};
  const changes: TrimChange[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldProcess = !keys || keys.includes(key);

    if (!shouldProcess) {
      trimmed[key] = value;
      continue;
    }

    const { value: newValue, type } = trimValue(value);

    trimmed[key] = newValue;

    if (type !== null && newValue !== value) {
      changes.push({ key, before: value, after: newValue, type });
    }
  }

  return { trimmed, changes, totalTrimmed: changes.length };
}
