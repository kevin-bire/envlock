import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../parser/envParser';
import { diffEnvs } from '../diff/envDiff';

export interface WatchEvent {
  filePath: string;
  timestamp: Date;
  previous: Record<string, string>;
  current: Record<string, string>;
  changes: ReturnType<typeof diffEnvs>;
}

export type WatchCallback = (event: WatchEvent) => void;

export interface WatchHandle {
  stop: () => void;
  filePath: string;
}

function readEnvSafe(filePath: string): Record<string, string> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseEnv(content);
  } catch {
    return {};
  }
}

export function watchEnvFile(
  filePath: string,
  callback: WatchCallback,
  options: { debounceMs?: number } = {}
): WatchHandle {
  const resolvedPath = path.resolve(filePath);
  const debounceMs = options.debounceMs ?? 300;

  let previous = readEnvSafe(resolvedPath);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = fs.watch(resolvedPath, (eventType) => {
    if (eventType !== 'change') return;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const current = readEnvSafe(resolvedPath);
      const changes = diffEnvs(previous, current);

      if (changes.added.length > 0 || changes.removed.length > 0 || changes.changed.length > 0) {
        callback({
          filePath: resolvedPath,
          timestamp: new Date(),
          previous,
          current,
          changes,
        });
      }

      previous = current;
    }, debounceMs);
  });

  return {
    filePath: resolvedPath,
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      watcher.close();
    },
  };
}
