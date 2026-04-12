import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  computeSimpleChecksum,
  loadHistory,
  saveHistory,
  recordHistory,
  getHistory,
} from '../envHistory';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envlock-history-'));
}

describe('computeSimpleChecksum', () => {
  it('returns a hex string', () => {
    const result = computeSimpleChecksum({ KEY: 'value' });
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it('returns same checksum for same env', () => {
    const env = { A: '1', B: '2' };
    expect(computeSimpleChecksum(env)).toBe(computeSimpleChecksum(env));
  });

  it('returns different checksum for different env', () => {
    expect(computeSimpleChecksum({ A: '1' })).not.toBe(computeSimpleChecksum({ A: '2' }));
  });
});

describe('loadHistory / saveHistory', () => {
  it('returns empty store if file does not exist', () => {
    const dir = makeTempDir();
    const store = loadHistory(path.join(dir, 'history.json'));
    expect(store.entries).toEqual([]);
  });

  it('saves and loads history', () => {
    const dir = makeTempDir();
    const histPath = path.join(dir, 'history.json');
    const store = { entries: [{ timestamp: 'ts', file: 'f', checksum: 'abc', keys: ['A'], snapshot: { A: '1' } }] };
    saveHistory(histPath, store);
    const loaded = loadHistory(histPath);
    expect(loaded.entries).toHaveLength(1);
    expect(loaded.entries[0].checksum).toBe('abc');
  });
});

describe('recordHistory', () => {
  it('records an entry for an env file', () => {
    const dir = makeTempDir();
    const envFile = path.join(dir, '.env');
    const histPath = path.join(dir, 'history.json');
    fs.writeFileSync(envFile, 'FOO=bar\nBAZ=qux\n');
    const entry = recordHistory(envFile, histPath);
    expect(entry.keys).toContain('FOO');
    expect(entry.keys).toContain('BAZ');
    expect(entry.checksum).toBeTruthy();
  });

  it('respects maxEntries limit', () => {
    const dir = makeTempDir();
    const envFile = path.join(dir, '.env');
    const histPath = path.join(dir, 'history.json');
    fs.writeFileSync(envFile, 'A=1\n');
    for (let i = 0; i < 5; i++) recordHistory(envFile, histPath, 3);
    const entries = getHistory(histPath);
    expect(entries.length).toBeLessThanOrEqual(3);
  });
});

describe('getHistory', () => {
  it('returns limited entries when limit is provided', () => {
    const dir = makeTempDir();
    const envFile = path.join(dir, '.env');
    const histPath = path.join(dir, 'history.json');
    fs.writeFileSync(envFile, 'X=1\n');
    for (let i = 0; i < 5; i++) recordHistory(envFile, histPath, 10);
    const entries = getHistory(histPath, 2);
    expect(entries).toHaveLength(2);
  });
});
