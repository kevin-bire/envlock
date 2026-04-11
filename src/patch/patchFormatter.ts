import { PatchOperation, PatchResult } from './envPatch';

const COLORS = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

export function formatOperation(op: PatchOperation, status: 'applied' | 'skipped'): string {
  const icon = status === 'applied' ? '✔' : '✘';
  const colorize = status === 'applied' ? COLORS.green : COLORS.yellow;

  if (op.op === 'set') {
    return colorize(`${icon} SET ${op.key}=${op.value}`);
  } else if (op.op === 'delete') {
    return colorize(`${icon} DELETE ${op.key}`);
  } else {
    return colorize(`${icon} RENAME ${op.key} → ${op.newKey}`);
  }
}

export function formatPatchResult(result: PatchResult): string {
  const lines: string[] = [];

  if (result.applied.length > 0) {
    lines.push('Applied operations:');
    result.applied.forEach(op => lines.push('  ' + formatOperation(op, 'applied')));
  }

  if (result.skipped.length > 0) {
    lines.push('Skipped operations:');
    result.skipped.forEach(op => lines.push('  ' + formatOperation(op, 'skipped')));
  }

  return lines.join('\n');
}

export function formatPatchSummary(result: PatchResult): string {
  const total = result.applied.length + result.skipped.length;
  const parts = [
    COLORS.green(`${result.applied.length} applied`),
    COLORS.yellow(`${result.skipped.length} skipped`),
    COLORS.dim(`${total} total`),
  ];
  return `Patch summary: ${parts.join(', ')}`;
}
