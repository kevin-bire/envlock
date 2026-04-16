import type { LowercaseChange, LowercaseResult } from './envLowercase';

export function formatLowercaseChange(change: LowercaseChange): string {
  const label = change.field === 'key' ? 'key' : 'value';
  return `  ~ [${label}] ${change.before} → ${change.after}`;
}

export function formatLowercaseResult(result: LowercaseResult): string {
  if (result.changes.length === 0) {
    return 'No changes made.';
  }
  const lines = result.changes.map(formatLowercaseChange);
  return lines.join('\n');
}

export function formatLowercaseSummary(result: LowercaseResult): string {
  const total = Object.keys(result.original).length;
  const changed = result.changes.length;
  const keyChanges = result.changes.filter(c => c.field === 'key').length;
  const valueChanges = result.changes.filter(c => c.field === 'value').length;

  const parts: string[] = [`Total keys: ${total}`, `Changed: ${changed}`];
  if (keyChanges > 0) parts.push(`Key changes: ${keyChanges}`);
  if (valueChanges > 0) parts.push(`Value changes: ${valueChanges}`);

  return parts.join(' | ');
}
