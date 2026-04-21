import { EnvMap } from '../parser/envParser';

export interface OmitResult {
  original: EnvMap;
  result: EnvMap;
  omitted: string[];
  skipped: string[];
}

export function formatOmittedEntry(key: string): string {
  return `  - ${key} (omitted)`;
}

export function formatSkippedEntry(key: string): string {
  return `  ~ ${key} (not found, skipped)`;
}

export function formatOmitResult(result: OmitResult): string {
  const lines: string[] = [];

  if (result.omitted.length > 0) {
    lines.push('Omitted keys:');
    for (const key of result.omitted) {
      lines.push(formatOmittedEntry(key));
    }
  }

  if (result.skipped.length > 0) {
    lines.push('Skipped (not found):');
    for (const key of result.skipped) {
      lines.push(formatSkippedEntry(key));
    }
  }

  if (result.omitted.length === 0 && result.skipped.length === 0) {
    lines.push('No keys omitted.');
  }

  return lines.join('\n');
}

export function formatOmitSummary(result: OmitResult): string {
  const total = Object.keys(result.original).length;
  const remaining = Object.keys(result.result).length;
  const omittedCount = result.omitted.length;
  const skippedCount = result.skipped.length;

  return [
    `Total keys: ${total}`,
    `Omitted:    ${omittedCount}`,
    `Skipped:    ${skippedCount}`,
    `Remaining:  ${remaining}`,
  ].join('\n');
}
