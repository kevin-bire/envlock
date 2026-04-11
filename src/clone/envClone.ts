import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../parser/envParser';

export interface CloneOptions {
  overwrite?: boolean;
  keys?: string[];
  excludeKeys?: string[];
}

export interface CloneResult {
  source: string;
  destination: string;
  cloned: string[];
  skipped: string[];
  overwritten: string[];
  success: boolean;
  error?: string;
}

export function cloneEnv(
  sourcePath: string,
  destPath: string,
  options: CloneOptions = {}
): CloneResult {
  const { overwrite = false, keys, excludeKeys = [] } = options;

  const result: CloneResult = {
    source: sourcePath,
    destination: destPath,
    cloned: [],
    skipped: [],
    overwritten: [],
    success: false,
  };

  if (!fs.existsSync(sourcePath)) {
    result.error = `Source file not found: ${sourcePath}`;
    return result;
  }

  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  const sourceEnv = parseEnv(sourceContent);

  let destEnv: Record<string, string> = {};
  const destExists = fs.existsSync(destPath);

  if (destExists) {
    const destContent = fs.readFileSync(destPath, 'utf-8');
    destEnv = parseEnv(destContent);
  }

  const targetKeys = keys
    ? keys.filter((k) => k in sourceEnv)
    : Object.keys(sourceEnv);

  const filteredKeys = targetKeys.filter((k) => !excludeKeys.includes(k));

  const lines: string[] = [];

  for (const key of filteredKeys) {
    if (key in destEnv && !overwrite) {
      result.skipped.push(key);
    } else if (key in destEnv && overwrite) {
      result.overwritten.push(key);
      result.cloned.push(key);
    } else {
      result.cloned.push(key);
    }
  }

  const mergedEnv = { ...destEnv };
  for (const key of result.cloned) {
    mergedEnv[key] = sourceEnv[key];
  }

  for (const [k, v] of Object.entries(mergedEnv)) {
    lines.push(`${k}=${v}`);
  }

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(destPath, lines.join('\n') + '\n', 'utf-8');
  result.success = true;
  return result;
}
