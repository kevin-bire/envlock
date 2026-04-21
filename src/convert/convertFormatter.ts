import { ConvertFormat, ConvertResult } from './envConvert';

export function formatConvertSummary(
  result: ConvertResult,
  inputFile?: string
): string {
  const lines: string[] = [];
  lines.push(`✔ Converted ${result.keyCount} key(s) to ${result.format.toUpperCase()} format`);
  if (inputFile) {
    lines.push(`  Source: ${inputFile}`);
  }
  return lines.join('\n');
}

export function formatConvertResult(
  result: ConvertResult,
  preview: boolean = false
): string {
  const lines: string[] = [];
  const header = `--- [${result.format.toUpperCase()}] (${result.keyCount} keys) ---`;
  lines.push(header);

  if (preview) {
    const outputLines = result.output.split('\n');
    const previewLines = outputLines.slice(0, 5);
    lines.push(...previewLines);
    if (outputLines.length > 5) {
      lines.push('  ... (truncated)');
    }
  } else {
    lines.push(result.output);
  }

  return lines.join('\n');
}

export function formatSupportedFormats(formats: ConvertFormat[]): string {
  return `Supported formats: ${formats.map(f => f.toUpperCase()).join(', ')}`;
}

/**
 * Formats a diff-style summary comparing two conversion results,
 * useful for showing what changed when re-converting with a different format.
 */
export function formatConvertComparison(
  before: ConvertResult,
  after: ConvertResult
): string {
  const lines: string[] = [];
  lines.push(`Format: ${before.format.toUpperCase()} → ${after.format.toUpperCase()}`);
  lines.push(`Keys:   ${before.keyCount} → ${after.keyCount}`);
  if (before.keyCount !== after.keyCount) {
    const delta = after.keyCount - before.keyCount;
    lines.push(`  (${delta > 0 ? '+' : ''}${delta} key(s))`);
  }
  return lines.join('\n');
}
