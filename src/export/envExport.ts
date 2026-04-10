import * as fs from 'fs';
import * as path from 'path';
import { ParsedEnv } from '../parser/envParser';

export type ExportFormat = 'json' | 'yaml' | 'dotenv';

export interface ExportOptions {
  format: ExportFormat;
  maskSecrets?: boolean;
  secretPattern?: RegExp;
}

const DEFAULT_SECRET_PATTERN = /secret|password|token|key|api/i;

export function maskExportValue(key: string, value: string, pattern: RegExp): string {
  return pattern.test(key) ? '***' : value;
}

export function toJson(env: ParsedEnv, options: ExportOptions): string {
  const pattern = options.secretPattern ?? DEFAULT_SECRET_PATTERN;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = options.maskSecrets ? maskExportValue(key, value, pattern) : value;
  }
  return JSON.stringify(result, null, 2);
}

export function toYaml(env: ParsedEnv, options: ExportOptions): string {
  const pattern = options.secretPattern ?? DEFAULT_SECRET_PATTERN;
  const lines: string[] = [];
  for (const [key, value] of Object.entries(env)) {
    const exportedValue = options.maskSecrets ? maskExportValue(key, value, pattern) : value;
    lines.push(`${key}: "${exportedValue}"`);
  }
  return lines.join('\n');
}

export function toDotenv(env: ParsedEnv, options: ExportOptions): string {
  const pattern = options.secretPattern ?? DEFAULT_SECRET_PATTERN;
  const lines: string[] = [];
  for (const [key, value] of Object.entries(env)) {
    const exportedValue = options.maskSecrets ? maskExportValue(key, value, pattern) : value;
    lines.push(`${key}=${exportedValue}`);
  }
  return lines.join('\n');
}

export function exportEnv(env: ParsedEnv, options: ExportOptions): string {
  switch (options.format) {
    case 'json':
      return toJson(env, options);
    case 'yaml':
      return toYaml(env, options);
    case 'dotenv':
      return toDotenv(env, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

export function saveExport(content: string, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (dir && dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, content, 'utf-8');
}
