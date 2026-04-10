import { EnvMap } from '../parser/envParser';

export interface RedactOptions {
  keys?: string[];
  patterns?: RegExp[];
  placeholder?: string;
}

export interface RedactResult {
  original: EnvMap;
  redacted: EnvMap;
  redactedKeys: string[];
}

const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

const DEFAULT_PLACEHOLDER = '***REDACTED***';

export function shouldRedact(
  key: string,
  options: RedactOptions = {}
): boolean {
  const { keys = [], patterns = DEFAULT_SENSITIVE_PATTERNS } = options;

  if (keys.includes(key)) return true;

  return patterns.some((pattern) => pattern.test(key));
}

export function redactEnv(
  env: EnvMap,
  options: RedactOptions = {}
): RedactResult {
  const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
  const redacted: EnvMap = {};
  const redactedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (shouldRedact(key, options)) {
      redacted[key] = placeholder;
      redactedKeys.push(key);
    } else {
      redacted[key] = value;
    }
  }

  return {
    original: env,
    redacted,
    redactedKeys,
  };
}
