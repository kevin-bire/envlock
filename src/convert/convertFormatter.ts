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
    const previewLines = result.output.split('\n').slice(0, 5);
    lines.push(...previewLines);
    if (result.output.split('\n').length > 5) {
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
