import { DiffEntry, DiffResult } from './envDiff';

const SENSITIVE_PATTERN = /secret|password|token|key|auth|pass|pwd/i;

export function maskValue(key: string, value: string | undefined): string {
  if (!value) return '';
  return SENSITIVE_PATTERN.test(key) ? '****' : value;
}

export function formatEntry(entry: DiffEntry): string {
  const { key, status, oldValue, newValue } = entry;
  switch (status) {
    case 'added':
      return `+ ${key}=${maskValue(key, newValue)}`;
    case 'removed':
      return `- ${key}=${maskValue(key, oldValue)}`;
    case 'changed':
      return `~ ${key}: ${maskValue(key, oldValue)} → ${maskValue(key, newValue)}`;
    case 'unchanged':
      return `  ${key}=${maskValue(key, oldValue)}`;
    default:
      return `  ${key}`;
  }
}

export function formatDiff(result: DiffResult, showUnchanged = false): string {
  const lines: string[] = [];

  for (const entry of result.entries) {
    if (!showUnchanged && entry.status === 'unchanged') continue;
    lines.push(formatEntry(entry));
  }

  lines.push('');
  lines.push(
    `Summary: +${result.added} added, -${result.removed} removed, ~${result.changed} changed, ${result.unchanged} unchanged`
  );

  return lines.join('\n');
}
