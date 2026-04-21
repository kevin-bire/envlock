import { RenameOperation, RenameResult } from './envRename';

export function formatOperation(op: RenameOperation): string {
  if (op.skipped) {
    return `  ⚠  ${op.from} → ${op.to}  [skipped: ${op.reason}]`;
  }
  return `  ✔  ${op.from} → ${op.to}`;
}

export function formatRenameResult(result: RenameResult): string {
  if (result.operations.length === 0) {
    return 'No rename operations defined.';
  }
  return result.operations.map(formatOperation).join('\n');
}

export function formatRenameSummary(result: RenameResult): string {
  return [
    `Renamed : ${result.renamed}`,
    `Skipped : ${result.skipped}`,
  ].join('\n');
}

export function formatRenameReport(result: RenameResult): string {
  const lines: string[] = ['Rename Report', '─'.repeat(40)];
  lines.push(formatRenameResult(result));
  lines.push('─'.repeat(40));
  lines.push(formatRenameSummary(result));
  return lines.join('\n');
}
