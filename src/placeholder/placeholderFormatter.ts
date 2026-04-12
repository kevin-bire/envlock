import { PlaceholderResult } from './envPlaceholder';

export function formatReplacedEntry(key: string, original: string, filled: string): string {
  return `  ✔ ${key}: "${original}" → "${filled}"`;
}

export function formatSkippedEntry(key: string, reason: string): string {
  return `  ⚠ ${key}: skipped (${reason})`;
}

export function formatMissingPlaceholder(name: string): string {
  return `  ✘ {{${name}}}: no replacement value provided`;
}

export function formatPlaceholderResult(
  result: PlaceholderResult,
  original: Record<string, string>
): string {
  const lines: string[] = [];

  if (result.replaced.length > 0) {
    lines.push('Replaced:');
    for (const key of result.replaced) {
      lines.push(formatReplacedEntry(key, original[key] ?? '', result.filled[key] ?? ''));
    }
  }

  if (result.skipped.length > 0) {
    lines.push('Skipped:');
    for (const key of result.skipped) {
      lines.push(formatSkippedEntry(key, 'missing replacement'));
    }
  }

  if (result.missing.length > 0) {
    lines.push('Missing placeholders:');
    for (const name of result.missing) {
      lines.push(formatMissingPlaceholder(name));
    }
  }

  return lines.join('\n');
}

export function formatPlaceholderSummary(result: PlaceholderResult): string {
  const parts: string[] = [
    `${result.replaced.length} replaced`,
    `${result.skipped.length} skipped`,
    `${result.missing.length} missing`,
  ];
  return `Placeholder fill complete: ${parts.join(', ')}.`;
}

/**
 * Returns true if the result contains any warnings or errors that the caller
 * should surface to the user (i.e. skipped or missing entries exist).
 */
export function hasPlaceholderWarnings(result: PlaceholderResult): boolean {
  return result.skipped.length > 0 || result.missing.length > 0;
}
