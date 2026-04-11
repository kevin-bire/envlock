import { ExtractResult } from './envExtract';

export function formatExtractSummary(result: ExtractResult): string {
  const lines: string[] = [];
  lines.push(`Extracted : ${result.found.length} key(s)`);
  if (result.missing.length > 0) {
    lines.push(`Missing   : ${result.missing.length} key(s)`);
  }
  return lines.join('\n');
}

export function formatExtractResult(result: ExtractResult): string {
  const lines: string[] = [];

  if (result.found.length > 0) {
    lines.push('Extracted keys:');
    for (const key of result.found) {
      lines.push(`  ✔ ${key}`);
    }
  }

  if (result.missing.length > 0) {
    lines.push('Missing keys:');
    for (const key of result.missing) {
      lines.push(`  ✘ ${key}`);
    }
  }

  lines.push('');
  lines.push(formatExtractSummary(result));

  return lines.join('\n');
}

export function formatExtractPreview(
  result: ExtractResult,
  mask = false
): string {
  const lines: string[] = ['Preview:'];
  for (const [key, value] of Object.entries(result.extracted)) {
    const display = mask ? '****' : value;
    lines.push(`  ${key}=${display}`);
  }
  return lines.join('\n');
}
