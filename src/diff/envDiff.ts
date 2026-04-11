import { ParsedEnv } from '../parser/envParser';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  oldValue?: string;
  newValue?: string;
}

export interface DiffResult {
  entries: DiffEntry[];
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

export function diffEnvs(base: ParsedEnv, target: ParsedEnv): DiffResult {
  const entries: DiffEntry[] = [];
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  let added = 0, removed = 0, changed = 0, unchanged = 0;

  for (const key of Array.from(allKeys).sort()) {
    const inBase = key in base;
    const inTarget = key in target;

    if (!inBase && inTarget) {
      entries.push({ key, status: 'added', newValue: target[key] });
      added++;
    } else if (inBase && !inTarget) {
      entries.push({ key, status: 'removed', oldValue: base[key] });
      removed++;
    } else if (base[key] !== target[key]) {
      entries.push({ key, status: 'changed', oldValue: base[key], newValue: target[key] });
      changed++;
    } else {
      entries.push({ key, status: 'unchanged', oldValue: base[key], newValue: target[key] });
      unchanged++;
    }
  }

  return { entries, added, removed, changed, unchanged };
}
