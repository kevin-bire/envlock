import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  computeChecksum,
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
} from '../envSnapshot';
import { formatSnapshotSummary, maskSnapshotValue } from '../snapshotFormatter';

describe('computeChecksum', () => {
  it('returns a hex string', () => {
    const checksum = computeChecksum({ FOO: 'bar', BAZ: 'qux' });
    expect(checksum).toMatch(/^[0-9a-f]{8}$/);
  });

  it('produces the same checksum for the same values regardless of key order', () => {
    const a = computeChecksum({ FOO: '1', BAR: '2' });
    const b = computeChecksum({ BAR: '2', FOO: '1' });
    expect(a).toBe(b);
  });

  it('produces different checksums for different values', () => {
    const a = computeChecksum({ FOO: 'bar' });
    const b = computeChecksum({ FOO: 'baz' });
    expect(a).not.toBe(b);
  });
});

describe('createSnapshot', () => {
  it('creates a snapshot from a .env file', () => {
    const tmpFile = path.join(os.tmpdir(), '.env.test.snap');
    fs.writeFileSync(tmpFile, 'APP_NAME=envlock\nAPP_ENV=test\n', 'utf-8');
    const snapshot = createSnapshot(tmpFile, 'test');
    expect(snapshot.environment).toBe('test');
    expect(snapshot.values).toEqual({ APP_NAME: 'envlock', APP_ENV: 'test' });
    expect(snapshot.checksum).toBeTruthy();
    fs.unlinkSync(tmpFile);
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('round-trips a snapshot through the filesystem', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlock-snap-'));
    const snapshot = {
      timestamp: new Date().toISOString(),
      environment: 'staging',
      filePath: '.env.staging',
      values: { KEY: 'value' },
      checksum: 'abc12345',
    };
    const savedPath = saveSnapshot(snapshot, tmpDir);
    const loaded = loadSnapshot(savedPath);
    expect(loaded).toEqual(snapshot);
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('listSnapshots', () => {
  it('returns empty array when directory does not exist', () => {
    expect(listSnapshots('/nonexistent/path')).toEqual([]);
  });

  it('filters by environment prefix', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlock-list-'));
    fs.writeFileSync(path.join(tmpDir, 'prod-1.json'), '{}');
    fs.writeFileSync(path.join(tmpDir, 'staging-1.json'), '{}');
    const results = listSnapshots(tmpDir, 'prod');
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('prod-1.json');
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('maskSnapshotValue', () => {
  it('masks sensitive keys', () => {
    expect(maskSnapshotValue('DB_PASSWORD', 'secret123')).toBe('****');
    expect(maskSnapshotValue('API_TOKEN', 'tok_abc')).toBe('****');
  });

  it('does not mask non-sensitive keys', () => {
    expect(maskSnapshotValue('APP_NAME', 'envlock')).toBe('envlock');
  });
});

describe('formatSnapshotSummary', () => {
  it('includes key count and environment', () => {
    const snap = {
      timestamp: '2024-01-01T00:00:00.000Z',
      environment: 'prod',
      filePath: '.env.prod',
      values: { A: '1', B: '2' },
      checksum: 'deadbeef',
    };
    const summary = formatSnapshotSummary(snap);
    expect(summary).toContain('prod');
    expect(summary).toContain('2');
  });
});
