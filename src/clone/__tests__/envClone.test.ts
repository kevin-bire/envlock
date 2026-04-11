import * as fs from 'fs';
import * as path from 'path';
import { cloneEnv } from '../envClone';

const TMP_DIR = path.join(__dirname, '__tmp_clone__');
const SOURCE = path.join(TMP_DIR, 'source.env');
const DEST = path.join(TMP_DIR, 'dest.env');

beforeEach(() => {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
  if (fs.existsSync(DEST)) fs.unlinkSync(DEST);
});

afterAll(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

describe('cloneEnv', () => {
  it('clones all keys from source to a new destination file', () => {
    fs.writeFileSync(SOURCE, 'APP_ENV=production\nDB_HOST=localhost\nSECRET=abc123\n');
    const result = cloneEnv(SOURCE, DEST);
    expect(result.success).toBe(true);
    expect(result.cloned).toEqual(expect.arrayContaining(['APP_ENV', 'DB_HOST', 'SECRET']));
    expect(result.skipped).toHaveLength(0);
    const content = fs.readFileSync(DEST, 'utf-8');
    expect(content).toContain('APP_ENV=production');
    expect(content).toContain('DB_HOST=localhost');
  });

  it('skips existing keys in dest when overwrite is false', () => {
    fs.writeFileSync(SOURCE, 'APP_ENV=production\nDB_HOST=localhost\n');
    fs.writeFileSync(DEST, 'APP_ENV=staging\n');
    const result = cloneEnv(SOURCE, DEST, { overwrite: false });
    expect(result.skipped).toContain('APP_ENV');
    expect(result.cloned).toContain('DB_HOST');
    const content = fs.readFileSync(DEST, 'utf-8');
    expect(content).toContain('APP_ENV=staging');
  });

  it('overwrites existing keys when overwrite is true', () => {
    fs.writeFileSync(SOURCE, 'APP_ENV=production\n');
    fs.writeFileSync(DEST, 'APP_ENV=staging\n');
    const result = cloneEnv(SOURCE, DEST, { overwrite: true });
    expect(result.overwritten).toContain('APP_ENV');
    const content = fs.readFileSync(DEST, 'utf-8');
    expect(content).toContain('APP_ENV=production');
  });

  it('clones only specified keys', () => {
    fs.writeFileSync(SOURCE, 'APP_ENV=production\nDB_HOST=localhost\nSECRET=abc123\n');
    const result = cloneEnv(SOURCE, DEST, { keys: ['APP_ENV', 'SECRET'] });
    expect(result.cloned).toEqual(expect.arrayContaining(['APP_ENV', 'SECRET']));
    expect(result.cloned).not.toContain('DB_HOST');
  });

  it('excludes specified keys', () => {
    fs.writeFileSync(SOURCE, 'APP_ENV=production\nDB_HOST=localhost\nSECRET=abc123\n');
    const result = cloneEnv(SOURCE, DEST, { excludeKeys: ['SECRET'] });
    expect(result.cloned).not.toContain('SECRET');
    expect(result.cloned).toContain('APP_ENV');
    expect(result.cloned).toContain('DB_HOST');
  });

  it('returns error when source file does not exist', () => {
    const result = cloneEnv('/nonexistent/path.env', DEST);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Source file not found/);
  });
});
