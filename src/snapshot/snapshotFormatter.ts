import type { Snapshot } from './envSnapshot';

export function formatSnapshotHeader(snapshot: Snapshot): string {
  return [
    `Environment : ${snapshot.environment}`,
    `File        : ${snapshot.filePath}`,
    `Timestamp   : ${snapshot.timestamp}`,
    `Checksum    : ${snapshot.checksum}`,
  ].join('\n');
}

export function formatSnapshotValues(
  snapshot: Snapshot,
  mask: boolean = true
): string {
  const lines = Object.entries(snapshot.values).map(([key, value]) => {
    const display = mask ? maskSnapshotValue(key, value) : value;
    return `  ${key}=${display}`;
  });
  return lines.join('\n');
}

export function maskSnapshotValue(key: string, value: string): string {
  const sensitivePattern = /secret|password|token|key|pwd/i;
  if (sensitivePattern.test(key)) {
    return value.length > 0 ? '****' : '';
  }
  return value;
}

export function formatSnapshotSummary(snapshot: Snapshot): string {
  const keyCount = Object.keys(snapshot.values).length;
  return [
    formatSnapshotHeader(snapshot),
    `Keys        : ${keyCount}`,
  ].join('\n');
}

export function formatSnapshotFull(snapshot: Snapshot, mask: boolean = true): string {
  return [
    formatSnapshotHeader(snapshot),
    '---',
    formatSnapshotValues(snapshot, mask),
  ].join('\n');
}
