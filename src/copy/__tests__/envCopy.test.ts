import { copyKeys, copyAllMissing } from '../envCopy';

const source = { API_KEY: 'abc123', DB_URL: 'postgres://localhost', SECRET: 'xyz' };
const target = { API_KEY: 'existing', APP_NAME: 'myapp' };

describe('copyKeys', () => {
  it('copies specified keys from source to target', () => {
    const result = copyKeys(source, target, { keys: ['DB_URL'], overwrite: false });
    expect(result.copied).toHaveLength(1);
    expect(result.copied[0].key).toBe('DB_URL');
    expect(result.target['DB_URL']).toBe('postgres://localhost');
  });

  it('skips keys not found in source', () => {
    const result = copyKeys(source, target, { keys: ['MISSING_KEY'] });
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toBe('not found in source');
  });

  it('skips existing keys when overwrite is false', () => {
    const result = copyKeys(source, target, { keys: ['API_KEY'], overwrite: false });
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toBe('already exists in target');
    expect(result.target['API_KEY']).toBe('existing');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const result = copyKeys(source, target, { keys: ['API_KEY'], overwrite: true });
    expect(result.copied).toHaveLength(1);
    expect(result.target['API_KEY']).toBe('abc123');
  });

  it('preserves existing target keys not in copy list', () => {
    const result = copyKeys(source, target, { keys: ['SECRET'] });
    expect(result.target['APP_NAME']).toBe('myapp');
  });
});

describe('copyAllMissing', () => {
  it('copies only keys missing from target', () => {
    const result = copyAllMissing(source, target);
    expect(result.copied.map((c) => c.key)).toContain('DB_URL');
    expect(result.copied.map((c) => c.key)).toContain('SECRET');
    expect(result.copied.map((c) => c.key)).not.toContain('API_KEY');
  });

  it('returns empty copied when target has all source keys', () => {
    const full = { ...source };
    const result = copyAllMissing(source, full);
    expect(result.copied).toHaveLength(0);
  });
});
