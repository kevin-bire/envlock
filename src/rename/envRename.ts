import { EnvMap } from '../parser/envParser';

export interface RenameOperation {
  from: string;
  to: string;
  value: string;
  skipped: boolean;
  reason?: string;
}

export interface RenameResult {
  env: EnvMap;
  operations: RenameOperation[];
  renamed: number;
  skipped: number;
}

export function buildRenameMap(pairs: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of pairs) {
    const idx = pair.indexOf(':');
    if (idx === -1) {
      throw new Error(`Invalid rename pair "${pair}": expected format OLD:NEW`);
    }
    const from = pair.slice(0, idx).trim();
    const to = pair.slice(idx + 1).trim();
    if (!from || !to) {
      throw new Error(`Invalid rename pair "${pair}": both sides must be non-empty`);
    }
    map.set(from, to);
  }
  return map;
}

export function renameKeys(
  env: EnvMap,
  renameMap: Map<string, string>,
  overwrite = false
): RenameResult {
  const result: EnvMap = { ...env };
  const operations: RenameOperation[] = [];

  for (const [from, to] of renameMap.entries()) {
    if (!(from in env)) {
      operations.push({ from, to, value: '', skipped: true, reason: 'key not found' });
      continue;
    }

    if (to in result && !overwrite) {
      operations.push({
        from,
        to,
        value: env[from],
        skipped: true,
        reason: `target key "${to}" already exists`,
      });
      continue;
    }

    const value = result[from];
    delete result[from];
    result[to] = value;
    operations.push({ from, to, value, skipped: false });
  }

  const renamed = operations.filter((o) => !o.skipped).length;
  const skipped = operations.filter((o) => o.skipped).length;

  return { env: result, operations, renamed, skipped };
}
