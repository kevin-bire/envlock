import { ParsedEnv } from '../parser/envParser';

export type QuoteStyle = 'single' | 'double' | 'none' | 'auto';

export interface QuoteResult {
  original: Record<string, string>;
  quoted: Record<string, string>;
  changes: QuoteChange[];
}

export interface QuoteChange {
  key: string;
  before: string;
  after: string;
  reason: string;
}

const NEEDS_QUOTING_RE = /[\s#$"'\\]/;

export function quoteValue(value: string, style: QuoteStyle): string {
  if (style === 'none') return value;

  if (style === 'single') {
    const escaped = value.replace(/'/g, "'\\''")
    return `'${escaped}'`;
  }

  if (style === 'double') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
    return `"${escaped}"`;
  }

  // auto: only quote if value contains special characters or spaces
  if (!value || !NEEDS_QUOTING_RE.test(value)) return value;
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
  return `"${escaped}"`;
}

export function unquoteValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function quoteEnv(
  env: ParsedEnv,
  style: QuoteStyle = 'auto'
): QuoteResult {
  const original: Record<string, string> = {};
  const quoted: Record<string, string> = {};
  const changes: QuoteChange[] = [];

  for (const [key, value] of Object.entries(env)) {
    original[key] = value;
    const newValue = quoteValue(value, style);
    quoted[key] = newValue;

    if (newValue !== value) {
      changes.push({
        key,
        before: value,
        after: newValue,
        reason:
          style === 'auto'
            ? 'value contains special characters'
            : `applied ${style} quoting`,
      });
    }
  }

  return { original, quoted, changes };
}
