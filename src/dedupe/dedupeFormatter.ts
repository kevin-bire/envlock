import { DedupeResult, DuplicateEntry } from './envDedupe';

export function formatDuplicateEntry(entry: DuplicateEntry): string {
  const removed = entry.removedValues.map((v) => `"${v}"`).join(', ');
  return (
    `  [DUPLICATE] ${entry.key}\n` +
    `    kept    : "${entry.keptValue}"\n` +
    `    removed : ${removed} (${entry.occurrences - 1} duplicate${
      entry.occurrences - 1 !== 1 ? 's' : ''
    })`
  );
}

export function formatDedupeResult(result: DedupeResult): string {
  if (result.duplicates.length === 0) {
    return 'No duplicate keys found.';
  }

  const lines: string[] = ['Duplicate keys detected:\n'];
  for (const entry of result.duplicates) {
    lines.push(formatDuplicateEntry(entry));
  }
  return lines.join('\n');
}

export function formatDedupeSummary(result: DedupeResult): string {
  const { duplicates, totalRemoved } = result;
  if (duplicates.length === 0) {
    return '✔ No duplicates found. Environment is clean.';
  }
  return (
    `✖ Found ${duplicates.length} duplicate key${
      duplicates.length !== 1 ? 's' : ''
    }, removed ${totalRemoved} redundant entr${
      totalRemoved !== 1 ? 'ies' : 'y'
    }.`
  );
}
