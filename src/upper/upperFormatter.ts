import type { UpperResult } from './envUpper';

export function formatUpperChange(original: string, updated: string): string {
  return `  ${original} → ${updated}`;
}

export function formatUpperResult(
  result: UpperResult,
  target: 'keys' | 'values' | 'both',
  original: Record<string, string>
): string {
  const lines: string[] = [];
  lines.push(`Upper ${target}:`);

  if (result.changed.length === 0) {
    lines.push('  No changes.');
    return lines.join('\n');
  }

  for (const key of result.changed) {
    if (target === 'keys' || target === 'both') {
      const upperKey = key.toUpperCase();
      if (upperKey !== key) {
        lines.push(formatUpperChange(key, upperKey));
      }
    }
    if (target === 'values' || target === 'both') {
      const val = original[key] ?? original[key.toUpperCase()] ?? '';
      const upperVal = val.toUpperCase();
      if (upperVal !== val) {
        lines.push(`  [${key.toUpperCase()}] "${val}" → "${upperVal}"`);
      }
    }
  }

  return lines.join('\n');
}

export function formatUpperSummary(result: UpperResult): string {
  const total = result.changed.length + result.skipped.length;
  return [
    `Total keys: ${total}`,
    `Changed:    ${result.changed.length}`,
    `Skipped:    ${result.skipped.length}`,
  ].join('\n');
}
