import { StripResult } from './envStrip';

export function formatRemovedEntry(key: string): string {
  return `  - ${key}`;
}

export function formatStripResult(result: StripResult): string {
  const lines: string[] = [];

  if (result.removedCount === 0) {
    lines.push('No keys were stripped.');
    return lines.join('\n');
  }

  lines.push(`Stripped ${result.removedCount} key(s):`);
  for (const key of result.removedKeys.sort()) {
    lines.push(formatRemovedEntry(key));
  }

  return lines.join('\n');
}

export function formatStripSummary(result: StripResult): string {
  const total = Object.keys(result.original).length;
  const remaining = Object.keys(result.stripped).length;
  const lines: string[] = [
    `Total keys   : ${total}`,
    `Stripped     : ${result.removedCount}`,
    `Remaining    : ${remaining}`,
  ];
  return lines.join('\n');
}
