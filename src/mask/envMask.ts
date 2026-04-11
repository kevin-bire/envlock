import { ParsedEnv } from '../parser/envParser';

export interface MaskOptions {
  keys?: string[];
  patterns?: RegExp[];
  maskChar?: string;
  revealChars?: number;
}

export interface MaskResult {
  masked: ParsedEnv;
  maskedKeys: string[];
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

export function shouldMaskKey(
  key: string,
  options: MaskOptions
): boolean {
  if (options.keys?.includes(key)) return true;
  const patterns = options.patterns ?? DEFAULT_SENSITIVE_PATTERNS;
  return patterns.some((p) => p.test(key));
}

export function maskValue(
  value: string,
  maskChar: string = '*',
  revealChars: number = 0
): string {
  if (value.length === 0) return value;
  if (revealChars <= 0) return maskChar.repeat(Math.min(value.length, 8));
  const revealed = value.slice(-revealChars);
  return maskChar.repeat(Math.max(value.length - revealChars, 4)) + revealed;
}

export function maskEnv(
  env: ParsedEnv,
  options: MaskOptions = {}
): MaskResult {
  const maskChar = options.maskChar ?? '*';
  const revealChars = options.revealChars ?? 0;
  const maskedKeys: string[] = [];
  const masked: ParsedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    if (shouldMaskKey(key, options)) {
      masked[key] = maskValue(value, maskChar, revealChars);
      maskedKeys.push(key);
    } else {
      masked[key] = value;
    }
  }

  return { masked, maskedKeys };
}
