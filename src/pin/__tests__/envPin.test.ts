import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { pinKeys, unpinKeys, checkPins, loadPinStore } from '../envPin';

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envpin-test-'));
}

function writeFile(dir: string, name: string, content: string) {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('pinKeys', () => {
  it('pins existing keys from env file', () => {
    const dir = makeTempDir();
    const envFile = writeFile(dir, '.env', 'API_KEY=secret123\nDB_HOST=localhost\n');
    const pinFile = path.join(dir, '.envpins');

    const result = pinKeys(envFile, ['API_KEY'], pinFile);

    expect(result.pinned).toHaveLength(1);
    expect(result.pinned[0].key).toBe('API_KEY');
    expect(result.pinned[0].value).toBe('secret123');
    expect(result.alreadyPinned).toHaveLength(0);
    expect(result.notFound).toHaveLength(0);
  });

  it('marks missing keys as notFound', () => {
    const dir = makeTempDir();
    const envFile = writeFile(dir, '.env', 'API_KEY=secret123\n');
    const pinFile = path.join(dir, '.envpins');

    const result = pinKeys(envFile, ['MISSING_KEY'], pinFile);

    expect(result.notFound).toContain('MISSING_KEY');
    expect(result.pinned).toHaveLength(0);
  });

  it('marks duplicate pins as alreadyPinned', () => {
    const dir = makeTempDir();
    const envFile = writeFile(dir, '.env', 'API_KEY=secret123\n');
    const pinFile = path.join(dir, '.envpins');

    pinKeys(envFile, ['API_KEY'], pinFile);
    const result = pinKeys(envFile, ['API_KEY'], pinFile);

    expect(result.alreadyPinned).toContain('API_KEY');
    expect(result.pinned).toHaveLength(0);
  });

  it('persists pin store to disk', () => {
    const dir = makeTempDir();
    const envFile = writeFile(dir, '.env', 'TOKEN=abc\n');
    const pinFile = path.join(dir, '.envpins');

    pinKeys(envFile, ['TOKEN'], pinFile);
    const store = loadPinStore(pinFile);

    expect(store.entries).toHaveLength(1);
    expect(store.entries[0].key).toBe('TOKEN');
  });
});

describe('unpinKeys', () => {
  it('removes specified keys from pin store', () => {
    const dir = makeTempDir();
    const envFile = writeFile(dir, '.env', 'A=1\nB=2\n');
    const pinFile = path.join(dir, '.envpins');

    pinKeys(envFile, ['A', 'B'], pinFile);
    const removed = unpinKeys(['A'], pinFile);

    expect(removed).toContain('A');
    const store = loadPinStore(pinFile);
    expect(store.entries.map((e) => e.key)).not.toContain('A');
    expect(store.entries.map((e) => e.key)).toContain('B');
  });
});

describe('checkPins', () => {
  it('detects changed values', () => {
    const dir = makeTempDir();
    const envFile = writeFile(dir, '.env', 'API_KEY=original\n');
    const pinFile = path.join(dir, '.envpins');

    pinKeys(envFile, ['API_KEY'], pinFile);
    writeFile(dir, '.env', 'API_KEY=changed\n');

    const violations = checkPins(envFile, pinFile);
    expect(violations).toHaveLength(1);
    expect(violations[0].key).toBe('API_KEY');
    expect(violations[0].expected).toBe('original');
    expect(violations[0].actual).toBe('changed');
  });

  it('returns empty array when all pins match', () => {
    const dir = makeTempDir();
    const envFile = writeFile(dir, '.env', 'API_KEY=stable\n');
    const pinFile = path.join(dir, '.envpins');

    pinKeys(envFile, ['API_KEY'], pinFile);
    const violations = checkPins(envFile, pinFile);

    expect(violations).toHaveLength(0);
  });
});
