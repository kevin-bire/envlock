import { EnvMap } from '../parser/envParser';

export interface UniqueResult {
  original: EnvMap;
  unique: EnvMap;
  duplicateValues: Record<string, string[]>;
}

export function formatDuplicateValueEntry(
  value: string,
  keys: string[]
): string {
  return `  Value "${value}" shared by: ${keys.join(', ')}`;
}

export function formatUniqueResult(
  result: UniqueResult,
  verbose = false
): string {
  const lines: string[] = [];
  const dupCount = Object.keys(result.duplicateValues).length;

  if (dupCount === 0) {
    lines.push('✔ No duplicate values found.');
  } else {
    lines.push(`⚠ Found ${dupCount} duplicate value(s):`);
    for (const [value, keys] of Object.entries(result.duplicateValues)) {
      lines.push(formatDuplicateValueEntry(value, keys));
    }
  }

  if (verbose) {
    lines.push('');
    lines.push('Unique entries:');
    for (const [key, value] of Object.entries(result.unique)) {
      lines.push(`  ${key}=${value}`);
    }
  }

  return lines.join('\n');
}

export function formatUniqueSummary(result: UniqueResult): string {
  const total = Object.keys(result.original).length;
  const kept = Object.keys(result.unique).length;
  const removed = total - kept;
  return [
    `Total keys   : ${total}`,
    `Unique kept  : ${kept}`,
    `Removed dupes: ${removed}`,
  ].join('\n');
}
