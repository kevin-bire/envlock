import { FilterResult, FilterMode } from './envFilter';

export function formatFilterSummary(
  result: FilterResult,
  mode: FilterMode
): string {
  const total = result.matched.length + result.unmatched.length;
  const kept = Object.keys(result.filtered).length;
  const removed = total - kept;
  return [
    `Filter mode   : ${mode}`,
    `Total keys    : ${total}`,
    `Kept          : ${kept}`,
    `Removed       : ${removed}`,
    `Matched keys  : ${result.matched.length > 0 ? result.matched.join(', ') : 'none'}`,
  ].join('\n');
}

export function formatFilterResult(
  result: FilterResult,
  mode: FilterMode,
  verbose = false
): string {
  const lines: string[] = [];
  const kept = Object.keys(result.filtered);

  if (verbose) {
    if (kept.length > 0) {
      lines.push('Kept keys:');
      for (const key of kept) {
        lines.push(`  ✔ ${key}`);
      }
    }

    const removed =
      mode === 'include'
        ? result.unmatched
        : result.matched;

    if (removed.length > 0) {
      lines.push('Removed keys:');
      for (const key of removed) {
        lines.push(`  ✖ ${key}`);
      }
    }

    lines.push('');
  }

  lines.push(formatFilterSummary(result, mode));
  return lines.join('\n');
}
