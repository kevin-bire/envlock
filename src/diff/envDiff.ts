export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  baseValue?: string;
  targetValue?: string;
}

export interface EnvDiffResult {
  added: DiffEntry[];
  removed: DiffEntry[];
  changed: DiffEntry[];
  unchanged: DiffEntry[];
  hasDifferences: boolean;
}

export function diffEnvs(
  base: Record<string, string>,
  target: Record<string, string>
): EnvDiffResult {
  const result: EnvDiffResult = {
    added: [],
    removed: [],
    changed: [],
    unchanged: [],
    hasDifferences: false,
  };

  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  for (const key of allKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inTarget = Object.prototype.hasOwnProperty.call(target, key);

    if (inBase && !inTarget) {
      result.removed.push({ key, status: 'removed', baseValue: base[key] });
      result.hasDifferences = true;
    } else if (!inBase && inTarget) {
      result.added.push({ key, status: 'added', targetValue: target[key] });
      result.hasDifferences = true;
    } else if (base[key] !== target[key]) {
      result.changed.push({
        key,
        status: 'changed',
        baseValue: base[key],
        targetValue: target[key],
      });
      result.hasDifferences = true;
    } else {
      result.unchanged.push({
        key,
        status: 'unchanged',
        baseValue: base[key],
        targetValue: target[key],
      });
    }
  }

  return result;
}
