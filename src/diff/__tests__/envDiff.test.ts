import { diffEnvs } from '../envDiff';

describe('diffEnvs', () => {
  const base = { APP_NAME: 'myapp', DB_HOST: 'localhost', SECRET: 'abc' };
  const target = { APP_NAME: 'myapp', DB_HOST: 'production.db', API_KEY: 'xyz' };

  it('detects added keys', () => {
    const result = diffEnvs(base, target);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].key).toBe('API_KEY');
    expect(result.added[0].targetValue).toBe('xyz');
  });

  it('detects removed keys', () => {
    const result = diffEnvs(base, target);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].key).toBe('SECRET');
    expect(result.removed[0].baseValue).toBe('abc');
  });

  it('detects changed keys', () => {
    const result = diffEnvs(base, target);
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0].key).toBe('DB_HOST');
    expect(result.changed[0].baseValue).toBe('localhost');
    expect(result.changed[0].targetValue).toBe('production.db');
  });

  it('detects unchanged keys', () => {
    const result = diffEnvs(base, target);
    expect(result.unchanged).toHaveLength(1);
    expect(result.unchanged[0].key).toBe('APP_NAME');
  });

  it('sets hasDifferences to true when diffs exist', () => {
    const result = diffEnvs(base, target);
    expect(result.hasDifferences).toBe(true);
  });

  it('sets hasDifferences to false for identical envs', () => {
    const result = diffEnvs(base, base);
    expect(result.hasDifferences).toBe(false);
    expect(result.unchanged).toHaveLength(3);
  });

  it('handles empty base', () => {
    const result = diffEnvs({}, { KEY: 'val' });
    expect(result.added).toHaveLength(1);
    expect(result.removed).toHaveLength(0);
  });

  it('handles empty target', () => {
    const result = diffEnvs({ KEY: 'val' }, {});
    expect(result.removed).toHaveLength(1);
    expect(result.added).toHaveLength(0);
  });
});
