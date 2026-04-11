import { ParsedEnv } from '../parser/envParser';

export type TokenType = 'string' | 'number' | 'boolean' | 'null' | 'url' | 'path' | 'json';

export interface TokenizedEntry {
  key: string;
  value: string;
  type: TokenType;
}

export interface TokenizeResult {
  entries: TokenizedEntry[];
  typeCounts: Record<TokenType, number>;
}

const URL_PATTERN = /^https?:\/\/.+/i;
const PATH_PATTERN = /^(\/|\.\/|\.\.\/|[a-zA-Z]:\\).*/;
const JSON_PATTERN = /^[\[{].*[\]}]$/s;
const BOOL_VALUES = new Set(['true', 'false', '1', '0', 'yes', 'no']);

export function detectType(value: string): TokenType {
  if (value === '' || value.toLowerCase() === 'null' || value.toLowerCase() === 'none') {
    return 'null';
  }
  if (BOOL_VALUES.has(value.toLowerCase())) {
    return 'boolean';
  }
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return 'number';
  }
  if (URL_PATTERN.test(value)) {
    return 'url';
  }
  if (PATH_PATTERN.test(value)) {
    return 'path';
  }
  try {
    JSON.parse(value);
    if (JSON_PATTERN.test(value)) return 'json';
  } catch {
    // not json
  }
  return 'string';
}

export function tokenizeEnv(env: ParsedEnv): TokenizeResult {
  const typeCounts: Record<TokenType, number> = {
    string: 0,
    number: 0,
    boolean: 0,
    null: 0,
    url: 0,
    path: 0,
    json: 0,
  };

  const entries: TokenizedEntry[] = Object.entries(env).map(([key, value]) => {
    const type = detectType(value);
    typeCounts[type]++;
    return { key, value, type };
  });

  return { entries, typeCounts };
}
