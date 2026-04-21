import { SummarizeResult } from './envSummarize';

export function formatPrefixRow(prefix: string, count: number): string {
  return `  ${prefix}_*  →  ${count} key${count !== 1 ? 's' : ''}`;
}

export function formatSummarizeResult(result: SummarizeResult): string {
  const lines: string[] = [];

  lines.push('── Env Summary ──────────────────────────');
  lines.push(`  Total keys      : ${result.total}`);
  lines.push(`  Non-empty       : ${result.nonEmpty}`);
  lines.push(`  Empty           : ${result.empty}`);
  lines.push(`  Unique values   : ${result.uniqueValues}`);
  lines.push(`  Avg value length: ${result.averageValueLength}`);

  if (result.longestKey) {
    lines.push(`  Longest key     : ${result.longestKey}`);
    lines.push(`  Shortest key    : ${result.shortestKey}`);
  }

  const prefixEntries = Object.entries(result.prefixes);
  if (prefixEntries.length > 0) {
    lines.push('');
    lines.push('── Prefixes ──────────────────────────────');
    for (const [prefix, count] of prefixEntries.sort((a, b) => b[1] - a[1])) {
      lines.push(formatPrefixRow(prefix, count));
    }
  }

  lines.push('──────────────────────────────────────────');
  return lines.join('\n');
}

export function formatSummarizeSummary(result: SummarizeResult): string {
  const prefixCount = Object.keys(result.prefixes).length;
  return (
    `Summarized ${result.total} keys` +
    (prefixCount > 0 ? `, ${prefixCount} prefix group${prefixCount !== 1 ? 's' : ''}` : '') +
    (result.empty > 0 ? `, ${result.empty} empty` : '')
  );
}
