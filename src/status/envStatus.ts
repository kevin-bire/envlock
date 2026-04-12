import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../parser/envParser';

export interface EnvStatusEntry {
  key: string;
  hasValue: boolean;
  isEmpty: boolean;
  isComment: boolean;
  lineNumber: number;
}

export interface EnvStatusResult {
  file: string;
  exists: boolean;
  readable: boolean;
  totalLines: number;
  totalKeys: number;
  emptyValues: number;
  filledValues: number;
  entries: EnvStatusEntry[];
}

export function getEnvStatus(filePath: string): EnvStatusResult {
  const resolved = path.resolve(filePath);
  const exists = fs.existsSync(resolved);

  if (!exists) {
    return {
      file: filePath,
      exists: false,
      readable: false,
      totalLines: 0,
      totalKeys: 0,
      emptyValues: 0,
      filledValues: 0,
      entries: [],
    };
  }

  let content: string;
  try {
    content = fs.readFileSync(resolved, 'utf-8');
  } catch {
    return {
      file: filePath,
      exists: true,
      readable: false,
      totalLines: 0,
      totalKeys: 0,
      emptyValues: 0,
      filledValues: 0,
      entries: [],
    };
  }

  const lines = content.split('\n');
  const parsed = parseEnv(content);
  const entries: EnvStatusEntry[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = parsed[key] ?? '';
    entries.push({
      key,
      hasValue: value.length > 0,
      isEmpty: value.length === 0,
      isComment: trimmed.startsWith('#'),
      lineNumber: idx + 1,
    });
  });

  const emptyValues = entries.filter((e) => e.isEmpty).length;
  const filledValues = entries.filter((e) => e.hasValue).length;

  return {
    file: filePath,
    exists: true,
    readable: true,
    totalLines: lines.length,
    totalKeys: entries.length,
    emptyValues,
    filledValues,
    entries,
  };
}
