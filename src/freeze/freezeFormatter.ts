export interface FreezeResult {
  frozen: string[];
  skipped: string[];
}

export interface DriftEntry {
  key: string;
  expected: string;
  actual: string;
  masked?: boolean;
}

const MASK = '***';

export function formatFreezeResult(result: FreezeResult): string {
  const lines: string[] = [];

  if (result.frozen.length === 0 && result.skipped.length === 0) {
    return 'No keys frozen.';
  }

  if (result.frozen.length > 0) {
    lines.push('Frozen keys:');
    for (const key of result.frozen) {
      lines.push(`  + ${key} (frozen)`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push('Skipped keys (already frozen):');
    for (const key of result.skipped) {
      lines.push(`  ~ ${key} (skipped)`);
    }
  }

  return lines.join('\n');
}

export function formatFreezeSummary(result: FreezeResult): string {
  return `Freeze complete: ${result.frozen.length} frozen, ${result.skipped.length} skipped.`;
}

export function formatDriftEntry(entry: DriftEntry): string {
  const expected = entry.masked ? MASK : entry.expected;
  const actual = entry.masked ? MASK : entry.actual;
  return `  ${entry.key}: expected "${expected}" → got "${actual}"`;
}

export function formatDriftResult(drifts: DriftEntry[]): string {
  if (drifts.length === 0) {
    return 'No drift detected. All frozen keys match.';
  }

  const lines: string[] = ['Drift detected in frozen keys:'];
  for (const drift of drifts) {
    lines.push(formatDriftEntry(drift));
  }
  return lines.join('\n');
}

export function formatDriftSummary(drifts: DriftEntry[]): string {
  if (drifts.length === 0) {
    return 'Drift summary: no drift found.';
  }
  return `Drift summary: ${drifts.length} key(s) have drifted from frozen values.`;
}
