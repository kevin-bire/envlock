import { RenameOperation, RenameResult } from './envRename';

export function formatOperation(op: RenameOperation): string {
  if (op.skipped) {
    return `  ~ ${op.from} → ${op.to}  (skipped: ${op.reason})`;
  }
  return `  ✔ ${op.from} → ${op.to}  ["${op.value}"]`;
}

export function formatRenameResult(result: RenameResult): string {
  if (result.operations.length === 0) {
    return 'No rename operations defined.';
  }
  const lines: string[] = ['Rename operations:'];
  for (const op of result.operations) {
    lines.push(formatOperation(op));
  }
  return lines.join('\n');
}

export function formatRenameSummary(result: RenameResult): string {
  return `Renamed: ${result.renamed}  Skipped: ${result.skipped}`;
}

export function formatRenameReport(result: RenameResult): string {
  return [formatRenameResult(result), '', formatRenameSummary(result)].join('\n');
}
