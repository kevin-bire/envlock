import { PromoteResult } from './envPromote';

export function formatPromoteEntry(
  key: string,
  fromValue: string,
  toValue: string | undefined
): string {
  const arrow = toValue !== undefined ? '~' : '+';
  const label = toValue !== undefined ? 'overwritten' : 'added';
  return `  ${arrow} ${key} [${label}]: "${fromValue}"`;
}

export function formatSkippedEntry(key: string, reason: string): string {
  return `  - ${key}: ${reason}`;
}

export function formatPromoteResult(result: PromoteResult): string {
  const lines: string[] = [];

  if (result.dryRun) {
    lines.push('Dry run — no changes applied.\n');
  }

  if (result.promoted.length > 0) {
    lines.push('Promoted:');
    for (const { key, fromValue, toValue } of result.promoted) {
      lines.push(formatPromoteEntry(key, fromValue, toValue));
    }
  }

  if (result.skipped.length > 0) {
    lines.push('\nSkipped:');
    for (const { key, reason } of result.skipped) {
      lines.push(formatSkippedEntry(key, reason));
    }
  }

  return lines.join('\n');
}

export function formatPromoteSummary(result: PromoteResult): string {
  const total = result.promoted.length + result.skipped.length;
  const parts = [
    `Total keys considered: ${total}`,
    `Promoted: ${result.promoted.length}`,
    `Skipped: ${result.skipped.length}`,
  ];
  if (result.dryRun) {
    parts.push('(dry run)');
  }
  return parts.join(' | ');
}
