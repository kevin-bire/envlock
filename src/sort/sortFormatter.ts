import { SortResult } from './envSort';

export function formatSortChange(key: string, from: number, to: number): string {
  return `  ~ ${key}: position ${from + 1} → ${to + 1}`;
}

export function formatSortResult(result: SortResult): string {
  if (!result.changed) {
    return 'No changes — environment is already sorted.';
  }

  const originalKeys = Object.keys(result.original);
  const sortedKeys = Object.keys(result.sorted);

  const lines: string[] = ['Sorted keys:'];
  for (const key of result.movedKeys) {
    const from = originalKeys.indexOf(key);
    const to = sortedKeys.indexOf(key);
    lines.push(formatSortChange(key, from, to));
  }

  return lines.join('\n');
}

export function formatSortSummary(result: SortResult): string {
  const total = Object.keys(result.original).length;
  if (!result.changed) {
    return `Sort complete: ${total} keys, no changes needed.`;
  }
  return `Sort complete: ${total} keys, ${result.movedKeys.length} repositioned.`;
}
