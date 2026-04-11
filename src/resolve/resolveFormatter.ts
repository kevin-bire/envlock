import type { ResolveResult } from './envResolve';

const SOURCE_LABELS: Record<string, string> = {
  file: 'file',
  override: 'override',
  process: 'process',
};

export function formatResolvedEntry(
  key: string,
  value: string,
  source: string,
  maskSecrets = true
): string {
  const label = SOURCE_LABELS[source] ?? source;
  const display = maskSecrets && value.length > 0 ? '****' : value || '(empty)';
  return `  ${key}=${display}  [${label}]`;
}

export function formatConflicts(
  conflicts: ResolveResult['conflicts']
): string {
  if (conflicts.length === 0) return '';
  const lines = ['Conflicts (override wins):'];
  for (const { key, fileValue, overrideValue } of conflicts) {
    lines.push(`  ${key}: "${fileValue}" -> "${overrideValue}"`);
  }
  return lines.join('\n');
}

export function formatResolveResult(
  result: ResolveResult,
  maskSecrets = true
): string {
  const lines: string[] = ['Resolved environment:'];
  for (const [key, value] of Object.entries(result.resolved)) {
    const source = result.sources[key] ?? 'file';
    lines.push(formatResolvedEntry(key, value, source, maskSecrets));
  }
  return lines.join('\n');
}

export function formatResolveSummary(result: ResolveResult): string {
  const total = Object.keys(result.resolved).length;
  const overrides = Object.values(result.sources).filter(s => s === 'override').length;
  const fromProcess = Object.values(result.sources).filter(s => s === 'process').length;
  const parts = [
    `Total: ${total}`,
    `Overrides: ${overrides}`,
    `From process: ${fromProcess}`,
    `Missing values: ${result.missing.length}`,
    `Conflicts: ${result.conflicts.length}`,
  ];
  return parts.join(' | ');
}
