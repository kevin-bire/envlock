import { DefaultEntry, DefaultsResult } from './envDefaults';

export function formatDefaultEntry(entry: DefaultEntry): string {
  const status = entry.applied ? '✔ applied' : '– skipped';
  return `  ${status}  ${entry.key}=${entry.value}`;
}

export function formatDefaultsResult(result: DefaultsResult): string {
  const lines: string[] = [];

  if (result.applied.length > 0) {
    lines.push('Applied defaults:');
    for (const entry of result.applied) {
      lines.push(formatDefaultEntry(entry));
    }
  }

  if (result.skipped.length > 0) {
    lines.push('Skipped (already set):');
    for (const entry of result.skipped) {
      lines.push(formatDefaultEntry(entry));
    }
  }

  if (lines.length === 0) {
    lines.push('No defaults to apply.');
  }

  return lines.join('\n');
}

export function formatDefaultsSummary(result: DefaultsResult): string {
  const total = result.applied.length + result.skipped.length;
  return (
    `Defaults summary: ${result.applied.length} applied, ` +
    `${result.skipped.length} skipped out of ${total} total.`
  );
}
