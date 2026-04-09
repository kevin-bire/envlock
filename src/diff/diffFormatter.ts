import type { DiffEntry, EnvDiffResult } from './envDiff';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function maskValue(value: string, mask: boolean): string {
  return mask ? '*'.repeat(Math.min(value.length, 8)) : value;
}

function formatEntry(entry: DiffEntry, maskValues: boolean): string {
  const val = (v?: string) => maskValue(v ?? '', maskValues);

  switch (entry.status) {
    case 'added':
      return `${COLORS.green}+ ${entry.key}=${val(entry.targetValue)}${COLORS.reset}`;
    case 'removed':
      return `${COLORS.red}- ${entry.key}=${val(entry.baseValue)}${COLORS.reset}`;
    case 'changed':
      return (
        `${COLORS.yellow}~ ${entry.key}\n` +
        `  base:   ${val(entry.baseValue)}\n` +
        `  target: ${val(entry.targetValue)}${COLORS.reset}`
      );
    case 'unchanged':
      return `${COLORS.gray}  ${entry.key}=${val(entry.baseValue)}${COLORS.reset}`;
  }
}

export interface FormatOptions {
  maskValues?: boolean;
  showUnchanged?: boolean;
}

export function formatDiff(result: EnvDiffResult, options: FormatOptions = {}): string {
  const { maskValues = false, showUnchanged = false } = options;
  const lines: string[] = [];

  if (!result.hasDifferences) {
    return `${COLORS.bold}No differences found.${COLORS.reset}`;
  }

  for (const entry of result.added) lines.push(formatEntry(entry, maskValues));
  for (const entry of result.removed) lines.push(formatEntry(entry, maskValues));
  for (const entry of result.changed) lines.push(formatEntry(entry, maskValues));
  if (showUnchanged) {
    for (const entry of result.unchanged) lines.push(formatEntry(entry, maskValues));
  }

  const summary = `\n${COLORS.bold}Summary: +${result.added.length} -${result.removed.length} ~${result.changed.length}${COLORS.reset}`;
  lines.push(summary);

  return lines.join('\n');
}
