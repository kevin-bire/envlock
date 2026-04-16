import { CopyResult } from './envCopy';

export function formatCopiedEntry(key: string, value: string): string {
  const masked = value.length > 0 ? '*'.repeat(Math.min(value.length, 8)) : '(empty)';
  return `  + ${key} = ${masked}`;
}

export function formatSkippedEntry(key: string, reason: string): string {
  return `  ~ ${key} (skipped: ${reason})`;
}

export function formatCopyResult(result: CopyResult): string {
  const lines: string[] = [];
  if (result.copied.length > 0) {
    lines.push('Copied:');
    for (const { key, value } of result.copied) {
      lines.push(formatCopiedEntry(key, value));
    }
  }
  if (result.skipped.length > 0) {
    lines.push('Skipped:');
    for (const { key, reason } of result.skipped) {
      lines.push(formatSkippedEntry(key, reason));
    }
  }
  return lines.join('\n');
}

export function formatCopySummary(result: CopyResult): string {
  return `Copy complete: ${result.copied.length} copied, ${result.skipped.length} skipped.`;
}
