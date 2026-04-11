import { NormalizeChange, NormalizeResult } from './envNormalize';

export function formatNormalizeChange(change: NormalizeChange): string {
  return `  ~ ${change.key}: "${change.original}" → "${change.normalized}" (${change.reason})`;
}

export function formatNormalizeResult(result: NormalizeResult): string {
  const lines: string[] = [];

  if (result.changes.length === 0 && result.removedKeys.length === 0) {
    lines.push('✔ No normalization changes needed.');
    return lines.join('\n');
  }

  if (result.changes.length > 0) {
    lines.push('Normalized entries:');
    for (const change of result.changes) {
      lines.push(formatNormalizeChange(change));
    }
  }

  if (result.removedKeys.length > 0) {
    lines.push('Removed empty keys:');
    for (const key of result.removedKeys) {
      lines.push(`  - ${key}`);
    }
  }

  return lines.join('\n');
}

export function formatNormalizeSummary(result: NormalizeResult): string {
  const total = Object.keys(result.env).length;
  const changed = result.changes.length;
  const removed = result.removedKeys.length;
  return [
    `Normalize summary:`,
    `  Total keys  : ${total}`,
    `  Changed     : ${changed}`,
    `  Removed     : ${removed}`,
  ].join('\n');
}
