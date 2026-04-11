import { ParsedEnv } from '../parser/envParser';

export type PatchOperation =
  | { op: 'set'; key: string; value: string }
  | { op: 'delete'; key: string }
  | { op: 'rename'; key: string; newKey: string };

export interface PatchResult {
  original: ParsedEnv;
  patched: ParsedEnv;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

export function applyPatch(
  env: ParsedEnv,
  operations: PatchOperation[]
): PatchResult {
  const patched: ParsedEnv = { ...env };
  const applied: PatchOperation[] = [];
  const skipped: PatchOperation[] = [];

  for (const op of operations) {
    if (op.op === 'set') {
      patched[op.key] = op.value;
      applied.push(op);
    } else if (op.op === 'delete') {
      if (op.key in patched) {
        delete patched[op.key];
        applied.push(op);
      } else {
        skipped.push(op);
      }
    } else if (op.op === 'rename') {
      if (op.key in patched) {
        patched[op.newKey] = patched[op.key];
        delete patched[op.key];
        applied.push(op);
      } else {
        skipped.push(op);
      }
    }
  }

  return { original: env, patched, applied, skipped };
}

export function parsePatchFile(content: string): PatchOperation[] {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const ops: PatchOperation[] = [];

  for (const line of lines) {
    const [directive, ...rest] = line.split(/\s+/);
    if (directive === 'SET' && rest.length >= 2) {
      ops.push({ op: 'set', key: rest[0], value: rest.slice(1).join(' ') });
    } else if (directive === 'DELETE' && rest.length === 1) {
      ops.push({ op: 'delete', key: rest[0] });
    } else if (directive === 'RENAME' && rest.length === 2) {
      ops.push({ op: 'rename', key: rest[0], newKey: rest[1] });
    }
  }

  return ops;
}
