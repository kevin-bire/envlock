import { ParsedEnv } from '../parser/envParser';
import { DiffResult } from '../diff/envDiff';
import { diffEnvs } from '../diff/envDiff';
import * as fs from 'fs';
import * as path from 'path';

export interface SyncOptions {
  dryRun?: boolean;
  overwriteExisting?: boolean;
  addMissing?: boolean;
}

export interface SyncResult {
  added: string[];
  updated: string[];
  skipped: string[];
  filePath: string;
}

export function syncEnvs(
  source: ParsedEnv,
  target: ParsedEnv,
  targetPath: string,
  options: SyncOptions = {}
): SyncResult {
  const { dryRun = false, overwriteExisting = false, addMissing = true } = options;
  const diff: DiffResult = diffEnvs(source, target);

  const result: SyncResult = {
    added: [],
    updated: [],
    skipped: [],
    filePath: targetPath,
  };

  const merged: ParsedEnv = { ...target };

  if (addMissing) {
    for (const key of diff.missing) {
      merged[key] = source[key];
      result.added.push(key);
    }
  }

  if (overwriteExisting) {
    for (const key of diff.changed) {
      merged[key] = source[key];
      result.updated.push(key);
    }
  } else {
    for (const key of diff.changed) {
      result.skipped.push(key);
    }
  }

  if (!dryRun) {
    writeEnvFile(merged, targetPath);
  }

  return result;
}

export function writeEnvFile(env: ParsedEnv, filePath: string): void {
  const lines = Object.entries(env).map(([key, value]) => {
    const needsQuotes = /\s|#|=/.test(value);
    const formatted = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
    return `${key}=${formatted}`;
  });

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
}
