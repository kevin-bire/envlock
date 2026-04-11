import { TrimChange, TrimResult } from './envTrim';

const TYPE_LABELS: Record<TrimChange['type'], string> = {
  leading: 'leading whitespace',
  trailing: 'trailing whitespace',
  both: 'surrounding whitespace',
  quotes: 'surrounding quotes + whitespace',
};

export function formatTrimChange(change: TrimChange): string {
  const label = TYPE_LABELS[change.type];
  return `  ${change.key}: removed ${label} ("${change.before}" → "${change.after}")`;
}

export function formatTrimResult(result: TrimResult): string {
  if (result.changes.length === 0) {
    return 'No values required trimming.';
  }

  const lines = ['Trimmed values:', ...result.changes.map(formatTrimChange)];
  return lines.join('\n');
}

export function formatTrimSummary(result: TrimResult): string {
  const { totalTrimmed } = result;
  if (totalTrimmed === 0) return '✔ All values are clean.';
  return `✂ ${totalTrimmed} value${totalTrimmed !== 1 ? 's' : ''} trimmed.`;
}
