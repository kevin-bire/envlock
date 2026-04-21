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

export function buildRenameMap(
  raw: Record<string, string>
): Map<string, string> {
  const map = new Map<string, string>();
  for (const [from, to] of Object.entries(raw)) {
    if (from && to && from !== to) {
      map.set(from, to);
    }
  }
  return map;
}

export function renameKeys(
  env: EnvMap,
  renameMap: Map<string, string>
): RenameResult {
  const result: EnvMap = { ...env };
  const operations: RenameOperation[] = [];
  let renamed = 0;
  let skipped = 0;

  for (const [from, to] of renameMap.entries()) {
    if (!(from in env)) {
      operations.push({
        from,
        to,
        value: '',
        skipped: true,
        reason: `Key "${from}" not found`,
      });
      skipped++;
      continue;
    }

    if (to in result && to !== from) {
      operations.push({
        from,
        to,
        value: env[from],
        skipped: true,
        reason: `Target key "${to}" already exists`,
      });
      skipped++;
      continue;
    }

    const value = result[from];
    delete result[from];
    result[to] = value;

    operations.push({ from, to, value, skipped: false });
    renamed++;
  }

  return { env: result, operations, renamed, skipped };
}
