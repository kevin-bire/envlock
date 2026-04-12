export interface CountResult {
  total: number;
  byPrefix: Record<string, number>;
  unprefixed: number;
}

export function formatPrefixRow(prefix: string, count: number, total: number): string {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
  return `  ${prefix.padEnd(24)} ${String(count).padStart(4)}  (${pct}%)`;
}

export function formatCountResult(result: CountResult): string {
  const lines: string[] = [];
  lines.push(`Total keys: ${result.total}`);

  const prefixes = Object.keys(result.byPrefix).sort();
  if (prefixes.length > 0) {
    lines.push('\nBy prefix:');
    for (const prefix of prefixes) {
      lines.push(formatPrefixRow(prefix, result.byPrefix[prefix], result.total));
    }
  }

  if (result.unprefixed > 0) {
    lines.push(formatPrefixRow('(no prefix)', result.unprefixed, result.total));
  }

  return lines.join('\n');
}

export function formatCountSummary(result: CountResult): string {
  const prefixCount = Object.keys(result.byPrefix).length;
  return [
    `${result.total} key(s) found across ${prefixCount} prefix group(s).`,
    result.unprefixed > 0
      ? `${result.unprefixed} key(s) have no prefix.`
      : null,
  ]
    .filter(Boolean)
    .join(' ');
}
