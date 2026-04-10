import { ExportFormat } from './envExport';

export interface ExportSummary {
  format: ExportFormat;
  totalKeys: number;
  maskedKeys: number;
  outputPath?: string;
}

export function formatExportSummary(summary: ExportSummary): string {
  const lines: string[] = [];
  lines.push(`Export Summary`);
  lines.push(`  Format     : ${summary.format.toUpperCase()}`);
  lines.push(`  Total Keys : ${summary.totalKeys}`);
  if (summary.maskedKeys > 0) {
    lines.push(`  Masked Keys: ${summary.maskedKeys}`);
  }
  if (summary.outputPath) {
    lines.push(`  Output     : ${summary.outputPath}`);
  }
  return lines.join('\n');
}

export function buildExportSummary(
  env: Record<string, string>,
  format: ExportFormat,
  secretPattern: RegExp,
  maskSecrets: boolean,
  outputPath?: string
): ExportSummary {
  const maskedKeys = maskSecrets
    ? Object.keys(env).filter((k) => secretPattern.test(k)).length
    : 0;
  return {
    format,
    totalKeys: Object.keys(env).length,
    maskedKeys,
    outputPath,
  };
}

export function formatExportPreview(content: string, maxLines = 10): string {
  const lines = content.split('\n');
  const preview = lines.slice(0, maxLines);
  const truncated = lines.length > maxLines;
  const output = preview.join('\n');
  return truncated ? `${output}\n... (${lines.length - maxLines} more lines)` : output;
}
