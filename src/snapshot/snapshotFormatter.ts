import { EnvSnapshot } from './envSnapshot';

const SENSITIVE_KEY_PATTERNS = /password|secret|key|token|url|dsn|credential/i;

export function maskSnapshotValue(key: string, value: string): string {
  if (SENSITIVE_KEY_PATTERNS.test(key)) {
    return '**********';
  }
  return value;
}

export function formatSnapshotHeader(snapshot: EnvSnapshot): string {
  const lines = [
    `Snapshot ID  : ${snapshot.id}`,
    `Environment  : ${snapshot.environment}`,
    `Timestamp    : ${snapshot.timestamp}`,
    `Checksum     : ${snapshot.checksum}`,
  ];
  return lines.join('\n');
}

export function formatSnapshotValues(
  values: Record<string, string>,
  mask: boolean
): string {
  return Object.entries(values)
    .map(([key, value]) => {
      const displayValue = mask ? maskSnapshotValue(key, value) : value;
      return `  ${key}=${displayValue}`;
    })
    .join('\n');
}

export function formatSnapshotSummary(snapshot: EnvSnapshot): string {
  const keyCount = Object.keys(snapshot.values).length;
  return [
    formatSnapshotHeader(snapshot),
    `Keys         : ${keyCount}`,
  ].join('\n');
}

export function formatSnapshotFull(
  snapshot: EnvSnapshot,
  mask = true
): string {
  const separator = '-'.repeat(48);
  return [
    separator,
    formatSnapshotHeader(snapshot),
    separator,
    formatSnapshotValues(snapshot.values, mask),
    separator,
  ].join('\n');
}
