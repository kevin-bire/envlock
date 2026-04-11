import { PrefixResult } from './envPrefix';

export function formatPrefixChange(
  oldKey: string,
  newKey: string,
  value: string,
  mask = true
): string {
  const display = mask ? '****' : value;
  return `  ${oldKey} → ${newKey} (${display})`;
}

export function formatPrefixResult(
  result: PrefixResult,
  mode: 'add' | 'remove',
  prefix: string,
  mask = true
): string {
  const lines: string[] = [];
  const changedCount = Object.keys(result.updated).length;

  lines.push(`Prefix ${mode === 'add' ? 'added' : 'removed'}: "${prefix}"`);
  lines.push('');

  if (changedCount > 0) {
    lines.push('Changed:');
    for (const entry of Object.values(result.updated)) {
      lines.push(formatPrefixChange(entry.oldKey, entry.newKey, entry.value, mask));
    }
  } else {
    lines.push('No keys were changed.');
  }

  if (result.skipped.length > 0) {
    lines.push('');
    lines.push('Skipped (already prefixed):');
    for (const key of result.skipped) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}

export function formatPrefixSummary(
  result: PrefixResult,
  mode: 'add' | 'remove'
): string {
  const changed = Object.keys(result.updated).length;
  const skipped = result.skipped.length;
  const action = mode === 'add' ? 'prefixed' : 'unprefixed';
  return `${changed} key(s) ${action}, ${skipped} skipped.`;
}
