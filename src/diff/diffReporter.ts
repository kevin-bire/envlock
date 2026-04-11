import { DiffResult } from './envDiff';

export interface DiffSummary {
  totalKeys: number;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  hasChanges: boolean;
}

export function buildSummary(result: DiffResult): DiffSummary {
  const totalKeys = result.entries.length;
  return {
    totalKeys,
    added: result.added,
    removed: result.removed,
    changed: result.changed,
    unchanged: result.unchanged,
    hasChanges: result.added > 0 || result.removed > 0 || result.changed > 0,
  };
}

export function generateReport(result: DiffResult, baseLabel = 'base', targetLabel = 'target'): string {
  const summary = buildSummary(result);
  const lines: string[] = [
    `Diff Report: ${baseLabel} → ${targetLabel}`,
    '─'.repeat(40),
  ];

  if (!summary.hasChanges) {
    lines.push('No differences found.');
  } else {
    if (result.added > 0) {
      lines.push(`Added (${result.added}):`);
      result.entries.filter(e => e.status === 'added').forEach(e => lines.push(`  + ${e.key}`));
    }
    if (result.removed > 0) {
      lines.push(`Removed (${result.removed}):`);
      result.entries.filter(e => e.status === 'removed').forEach(e => lines.push(`  - ${e.key}`));
    }
    if (result.changed > 0) {
      lines.push(`Changed (${result.changed}):`);
      result.entries.filter(e => e.status === 'changed').forEach(e => lines.push(`  ~ ${e.key}`));
    }
  }

  lines.push('─'.repeat(40));
  lines.push(`Total: ${summary.totalKeys} keys | +${summary.added} -${summary.removed} ~${summary.changed}`);

  return lines.join('\n');
}
