import { syncEnvs, writeEnvFile } from '../envSync';
import { ParsedEnv } from '../../parser/envParser';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('syncEnvs', () => {
  const source: ParsedEnv = {
    API_KEY: 'abc123',
    DB_HOST: 'localhost',
    NEW_VAR: 'new_value',
  };

  const target: ParsedEnv = {
    API_KEY: 'old_key',
    DB_HOST: 'localhost',
  };

  it('adds missing keys from source by default', () => {
    const result = syncEnvs(source, target, '/tmp/fake.env', { dryRun: true });
    expect(result.added).toContain('NEW_VAR');
  });

  it('skips changed keys when overwriteExisting is false', () => {
    const result = syncEnvs(source, target, '/tmp/fake.env', { dryRun: true, overwriteExisting: false });
    expect(result.skipped).toContain('API_KEY');
    expect(result.updated).not.toContain('API_KEY');
  });

  it('updates changed keys when overwriteExisting is true', () => {
    const result = syncEnvs(source, target, '/tmp/fake.env', { dryRun: true, overwriteExisting: true });
    expect(result.updated).toContain('API_KEY');
    expect(result.skipped).not.toContain('API_KEY');
  });

  it('does not add missing keys when addMissing is false', () => {
    const result = syncEnvs(source, target, '/tmp/fake.env', { dryRun: true, addMissing: false });
    expect(result.added).not.toContain('NEW_VAR');
  });

  it('returns the correct filePath in result', () => {
    const result = syncEnvs(source, target, '/some/path/.env', { dryRun: true });
    expect(result.filePath).toBe('/some/path/.env');
  });
});

describe('writeEnvFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlock-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes key=value pairs to file', () => {
    const env: ParsedEnv = { FOO: 'bar', BAZ: 'qux' };
    const filePath = path.join(tmpDir, '.env');
    writeEnvFile(env, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('FOO=bar');
    expect(content).toContain('BAZ=qux');
  });

  it('quotes values containing spaces', () => {
    const env: ParsedEnv = { MSG: 'hello world' };
    const filePath = path.join(tmpDir, '.env');
    writeEnvFile(env, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('MSG="hello world"');
  });

  it('creates directory if it does not exist', () => {
    const nestedPath = path.join(tmpDir, 'nested', 'dir', '.env');
    writeEnvFile({ KEY: 'val' }, nestedPath);
    expect(fs.existsSync(nestedPath)).toBe(true);
  });
});
