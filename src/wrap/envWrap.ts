import { EnvMap } from '../parser/envParser';

export interface WrapOptions {
  width?: number;
  quoteChar?: '"' | "'";
  forceQuote?: boolean;
}

export interface WrapChange {
  key: string;
  original: string;
  wrapped: string;
  reason: string;
}

export interface WrapResult {
  env: EnvMap;
  changes: WrapChange[];
  unchanged: string[];
}

export function needsWrapping(value: string, quoteChar: string): boolean {
  if (value.startsWith(quoteChar) && value.endsWith(quoteChar)) return false;
  return /\s|#|=|\$|"|\'/.test(value) || value.trim() !== value;
}

export function wrapValue(value: string, quoteChar: '"' | "'" = '"'): string {
  const escaped = quoteChar === '"'
    ? value.replace(/"/g, '\\"')
    : value.replace(/'/g, "\\'");
  return `${quoteChar}${escaped}${quoteChar}`;
}

export function unwrapValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function wrapEnv(
  env: EnvMap,
  options: WrapOptions = {}
): WrapResult {
  const { quoteChar = '"', forceQuote = false } = options;
  const result: EnvMap = {};
  const changes: WrapChange[] = [];
  const unchanged: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldWrap = forceQuote || needsWrapping(value, quoteChar);

    if (shouldWrap) {
      const wrapped = wrapValue(value, quoteChar);
      result[key] = wrapped;
      changes.push({
        key,
        original: value,
        wrapped,
        reason: forceQuote ? 'force-quoted' : 'contains special characters or whitespace',
      });
    } else {
      result[key] = value;
      unchanged.push(key);
    }
  }

  return { env: result, changes, unchanged };
}
