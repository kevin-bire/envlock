import { MaskResult } from './envMask';
import { ParsedEnv } from '../parser/envParser';

export function formatMaskedEntry(
  key: string,
  original: string,
  masked: string,
  wasMasked: boolean
): string {
  if (wasMasked) {
    return `  ${key}=${masked}  (masked)`;
  }
  return `  ${key}=${original}`;
}

export function formatMaskResult(
  original: ParsedEnv,
  result: MaskResult
): string {
  const lines: string[] = [];
  const maskedSet = new Set(result.maskedKeys);

  for (const [key, value] of Object.entries(original)) {
    const wasMasked = maskedSet.has(key);
    const displayValue = wasMasked ? result.masked[key] : value;
    lines.push(formatMaskedEntry(key, value, displayValue, wasMasked));
  }

  return lines.join('\n');
}

export function formatMaskSummary(result: MaskResult): string {
  const total = Object.keys(result.masked).length;
  const maskedCount = result.maskedKeys.length;
  const lines: string[] = [
    `Mask Summary:`,
    `  Total keys : ${total}`,
    `  Masked     : ${maskedCount}`,
    `  Plain      : ${total - maskedCount}`,
  ];

  if (maskedCount > 0) {
    lines.push(`  Masked keys: ${result.maskedKeys.join(', ')}`);
  }

  return lines.join('\n');
}
