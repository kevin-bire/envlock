export interface RenameOperation {
  from: string;
  to: string;
  skipped?: boolean;
  reason?: string;
}

export interface RenameResult {
  operations: RenameOperation[];
  renamed: Record<string, string>;
  skipped: string[];
}

export function formatOperation(op: RenameOperation): string {
  if (op.skipped) {
    return `  ⚠ ${op.from} → ${op.to} (skipped: ${op.reason ?? 'unknown'})`;
  }
  return `  ✔ ${op.from} → ${op.to}`;
}

export function formatRenameResult(result: RenameResult): string {
  if (result.operations.length === 0) {
    return 'No rename operations to perform.';
  }
  const lines = result.operations.map(formatOperation);
  return lines.join('\n');
}

export function formatRenameSummary(result: RenameResult): string {
  const total = result.operations.length;
  const renamed = total - result.skipped.length;
  const lines: string[] = [
    `Rename Summary:`,
    `  Total operations : ${total}`,
    `  Renamed          : ${renamed}`,
    `  Skipped          : ${result.skipped.length}`,
  ];
  return lines.join('\n');
}

export function formatRenameReport(result: RenameResult): string {
  const parts: string[] = [];
  if (result.operations.length > 0) {
    parts.push('Operations:');
    parts.push(formatRenameResult(result));
  }
  parts.push('');
  parts.push(formatRenameSummary(result));
  return parts.join('\n');
}
