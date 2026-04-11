import { ParsedEnv } from '../parser/envParser';

export type ConvertFormat = 'json' | 'yaml' | 'shell' | 'dotenv';

export interface ConvertResult {
  format: ConvertFormat;
  output: string;
  keyCount: number;
}

export function toShellExports(env: ParsedEnv): string {
  return Object.entries(env)
    .map(([key, value]) => `export ${key}=${shellQuote(value)}`)
    .join('\n');
}

export function fromJson(raw: string): ParsedEnv {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('JSON must be a flat key-value object');
    }
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, String(v)])
    );
  } catch (e) {
    throw new Error(`Invalid JSON input: ${(e as Error).message}`);
  }
}

export function fromShell(raw: string): ParsedEnv {
  const result: ParsedEnv = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim().replace(/^export\s+/, '');
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).replace(/^['"]|['"]$/g, '');
    if (key) result[key] = val;
  }
  return result;
}

export function convertEnv(
  env: ParsedEnv,
  format: ConvertFormat
): ConvertResult {
  let output: string;
  const keyCount = Object.keys(env).length;

  switch (format) {
    case 'json':
      output = JSON.stringify(env, null, 2);
      break;
    case 'yaml':
      output = Object.entries(env)
        .map(([k, v]) => `${k}: "${v.replace(/"/g, '\\"')}"`)
        .join('\n');
      break;
    case 'shell':
      output = toShellExports(env);
      break;
    case 'dotenv':
      output = Object.entries(env)
        .map(([k, v]) => `${k}=${v.includes(' ') ? `"${v}"` : v}`)
        .join('\n');
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return { format, output, keyCount };
}

function shellQuote(value: string): string {
  if (/[\s"'\\$`!]/.test(value)) {
    return `'${value.replace(/'/g, "'\\''")}' `;
  }
  return value;
}
