import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../parser/envParser';

export interface ResolveOptions {
  overrides?: Record<string, string>;
  includeProcessEnv?: boolean;
  strict?: boolean;
}

export interface ResolveResult {
  resolved: Record<string, string>;
  sources: Record<string, 'file' | 'override' | 'process'>;
  missing: string[];
  conflicts: Array<{ key: string; fileValue: string; overrideValue: string }>;
}

export function resolveEnvFiles(
  filePaths: string[],
  options: ResolveOptions = {}
): ResolveResult {
  const resolved: Record<string, string> = {};
  const sources: Record<string, 'file' | 'override' | 'process'> = {};
  const conflicts: ResolveResult['conflicts'] = [];

  for (const filePath of filePaths) {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      if (options.strict) {
        throw new Error(`File not found: ${filePath}`);
      }
      continue;
    }
    const raw = fs.readFileSync(absPath, 'utf-8');
    const parsed = parseEnv(raw);
    for (const [key, value] of Object.entries(parsed)) {
      resolved[key] = value;
      sources[key] = 'file';
    }
  }

  if (options.includeProcessEnv) {
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined && !(key in resolved)) {
        resolved[key] = value;
        sources[key] = 'process';
      }
    }
  }

  if (options.overrides) {
    for (const [key, value] of Object.entries(options.overrides)) {
      if (key in resolved && resolved[key] !== value) {
        conflicts.push({ key, fileValue: resolved[key], overrideValue: value });
      }
      resolved[key] = value;
      sources[key] = 'override';
    }
  }

  const missing: string[] = Object.entries(resolved)
    .filter(([, v]) => v === '')
    .map(([k]) => k);

  return { resolved, sources, missing, conflicts };
}
