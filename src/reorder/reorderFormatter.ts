import type { ReorderResult } from './envReorder';

export function formatReorderChange(from: number, to: number, key: string): string {
  if (from === to) return `  = [${from}] ${key}`;
  return `  ~ [${from}→${to}] ${key}`;
}

export function formatReorderResult(result: ReorderResult): string {
  if (result.unchanged) return 'No changes — order is already correct.';

  const originalKeys = Object.keys(result.original);
  const lines: string[] = ['Reordered keys:'];

  for (const [newIndex, key] of result.order.entries()) {
    const oldIndex = originalKeys.indexOf(key);
    lines.push(formatReorderChange(oldIndex, newIndex, key));
  }

  return lines.join('\n');
}

export function formatReorderSummary(result: ReorderResult): string {
  if (result.unchanged) return 'Reorder: no changes needed.';
  const total = result.order.length;
  const moved = result.order.filter(
    (key, i) => Object.keys(result.original).indexOf(key) !== i
  ).length;
  return `Reorder: ${moved} of ${total} key(s) moved.`;
}
