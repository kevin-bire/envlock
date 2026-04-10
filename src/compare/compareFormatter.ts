import { CompareEntry, CompareResult } from './envCompare';

const ICONS: Record<string, string> = {
  match: '✔',
  mismatch: '≠',
  missing_in_target: '→',
  missing_in_source: '←',
};

const LABELS: Record<string, string> = {
  match: 'MATCH',
  mismatch: 'MISMATCH',
  missing_in_target: 'MISSING IN TARGET',
  missing_in_source: 'MISSING IN SOURCE',
};

export function maskCompareValue(value: string | undefined, masked: boolean): string {
  if (value === undefined) return '(none)';
  if (masked) return '*'.repeat(Math.min(value.length, 8));
  return value;
}

export function formatCompareEntry(entry: CompareEntry, masked = false): string {
  const icon = ICONS[entry.status];
  const label = LABELS[entry.status];
  const src = maskCompareValue(entry.sourceValue, masked);
  const tgt = maskCompareValue(entry.targetValue, masked);

  if (entry.status === 'match') {
    return `  ${icon} [${label}] ${entry.key} = ${src}`;
  }
  if (entry.status === 'mismatch') {
    return `  ${icon} [${label}] ${entry.key}\n       source: ${src}\n       target: ${tgt}`;
  }
  if (entry.status === 'missing_in_target') {
    return `  ${icon} [${label}] ${entry.key} = ${src}`;
  }
  return `  ${icon} [${label}] ${entry.key} = ${tgt}`;
}

export function formatCompareResult(result: CompareResult, masked = false): string {
  const lines: string[] = ['\n=== Environment Comparison ===\n'];

  for (const entry of result.entries) {
    lines.push(formatCompareEntry(entry, masked));
  }

  lines.push(
    `\n--- Summary ---`,
    `  Total keys     : ${result.totalKeys}`,
    `  Matches        : ${result.matchCount}`,
    `  Mismatches     : ${result.mismatchCount}`,
    `  Missing target : ${result.missingInTargetCount}`,
    `  Missing source : ${result.missingInSourceCount}`,
  );

  return lines.join('\n');
}
