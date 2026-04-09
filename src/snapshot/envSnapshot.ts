import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../parser/envParser';

export interface Snapshot {
  timestamp: string;
  environment: string;
  filePath: string;
  values: Record<string, string>;
  checksum: string;
}

export function computeChecksum(values: Record<string, string>): string {
  const sorted = Object.keys(values)
    .sort()
    .map((k) => `${k}=${values[k]}`)
    .join('\n');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    const char = sorted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function createSnapshot(filePath: string, environment: string): Snapshot {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const values = parseEnv(raw);
  return {
    timestamp: new Date().toISOString(),
    environment,
    filePath,
    values,
    checksum: computeChecksum(values),
  };
}

export function saveSnapshot(snapshot: Snapshot, snapshotDir: string): string {
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const filename = `${snapshot.environment}-${Date.now()}.json`;
  const outPath = path.join(snapshotDir, filename);
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return outPath;
}

export function loadSnapshot(snapshotPath: string): Snapshot {
  const raw = fs.readFileSync(snapshotPath, 'utf-8');
  return JSON.parse(raw) as Snapshot;
}

export function listSnapshots(snapshotDir: string, environment?: string): string[] {
  if (!fs.existsSync(snapshotDir)) return [];
  return fs
    .readdirSync(snapshotDir)
    .filter((f) => f.endsWith('.json') && (!environment || f.startsWith(environment)))
    .map((f) => path.join(snapshotDir, f))
    .sort();
}
