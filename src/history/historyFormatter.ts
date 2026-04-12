import type { HistoryEntry } from './envHistory';

export function formatHistoryEntry(entry: HistoryEntry, index: number): string {
  const lines: string[] = [];
  lines.push(`[${index + 1}] ${entry.timestamp}`);
  lines.push(`    File     : ${entry.file}`);
  lines.push(`    Checksum : ${entry.checksum}`);
  lines.push(`    Keys     : ${entry.keys.length} (${entry.keys.slice(0, 5).join(', ')}${entry.keys.length > 5 ? ', ...' : ''})`);
  return lines.join('\n');
}

export function formatHistoryResult(entries: HistoryEntry[]): string {
  if (entries.length === 0) {
    return 'No history entries found.';
  }
  return entries.map((e, i) => formatHistoryEntry(e, i)).join('\n\n');
}

export function formatHistorySummary(entries: HistoryEntry[]): string {
  const lines: string[] = [];
  lines.push(`History Summary`);
  lines.push(`  Total entries : ${entries.length}`);
  if (entries.length > 0) {
    lines.push(`  Latest        : ${entries[0].timestamp}`);
    lines.push(`  Oldest        : ${entries[entries.length - 1].timestamp}`);
    const checksums = new Set(entries.map(e => e.checksum));
    lines.push(`  Unique states : ${checksums.size}`);
  }
  return lines.join('\n');
}

export function formatHistoryDiff(
  a: HistoryEntry,
  b: HistoryEntry
): string {
  const lines: string[] = [];
  lines.push(`Comparing:`);
  lines.push(`  A: ${a.timestamp} (${a.checksum})`);
  lines.push(`  B: ${b.timestamp} (${b.checksum})`);

  const aKeys = new Set(a.keys);
  const bKeys = new Set(b.keys);
  const added = b.keys.filter(k => !aKeys.has(k));
  const removed = a.keys.filter(k => !bKeys.has(k));
  const changed = a.keys.filter(k => bKeys.has(k) && a.snapshot[k] !== b.snapshot[k]);

  if (added.length) lines.push(`  Added   : ${added.join(', ')}`);
  if (removed.length) lines.push(`  Removed : ${removed.join(', ')}`);
  if (changed.length) lines.push(`  Changed : ${changed.join(', ')}`);
  if (!added.length && !removed.length && !changed.length) {
    lines.push(`  No differences found.`);
  }
  return lines.join('\n');
}
