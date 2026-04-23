import { IndexEntry, IndexResult } from './envIndex';

const MASK = '****';

export function maskIndexValue(value: string, sensitive: boolean): string {
  return sensitive ? MASK : value;
}

export function formatIndexEntry(
  entry: IndexEntry,
  sensitive = false
): string {
  const displayValue = maskIndexValue(entry.value, sensitive);
  return `[${entry.position}] ${entry.key}=${displayValue}`;
}

export function formatIndexResult(
  result: IndexResult,
  sensitive = false
): string {
  if (result.total === 0) {
    return 'Index is empty.';
  }
  const lines = result.entries.map((e) => formatIndexEntry(e, sensitive));
  return lines.join('\n');
}

export function formatIndexSummary(result: IndexResult): string {
  return `Index contains ${result.total} key${result.total !== 1 ? 's' : ''}.`;
}

export function formatLookupResult(
  key: string,
  entry: IndexEntry | undefined,
  sensitive = false
): string {
  if (!entry) {
    return `Key "${key}" not found in index.`;
  }
  return `Found: ${formatIndexEntry(entry, sensitive)}`;
}
