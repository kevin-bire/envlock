import { compareEnvs } from '../envCompare';

describe('compareEnvs', () => {
  const source = { APP_NAME: 'myapp', DB_HOST: 'localhost', SECRET: 'abc123' };
  const target = { APP_NAME: 'myapp', DB_HOST: 'prod-db', PORT: '8080' };

  it('identifies matching keys', () => {
    const result = compareEnvs(source, target);
    const match = result.entries.find(e => e.key === 'APP_NAME');
    expect(match?.status).toBe('match');
  });

  it('identifies mismatched values', () => {
    const result = compareEnvs(source, target);
    const mismatch = result.entries.find(e => e.key === 'DB_HOST');
    expect(mismatch?.status).toBe('mismatch');
    expect(mismatch?.sourceValue).toBe('localhost');
    expect(mismatch?.targetValue).toBe('prod-db');
  });

  it('identifies keys missing in target', () => {
    const result = compareEnvs(source, target);
    const missing = result.entries.find(e => e.key === 'SECRET');
    expect(missing?.status).toBe('missing_in_target');
    expect(missing?.targetValue).toBeUndefined();
  });

  it('identifies keys missing in source', () => {
    const result = compareEnvs(source, target);
    const missing = result.entries.find(e => e.key === 'PORT');
    expect(missing?.status).toBe('missing_in_source');
    expect(missing?.sourceValue).toBeUndefined();
  });

  it('returns correct counts', () => {
    const result = compareEnvs(source, target);
    expect(result.matchCount).toBe(1);
    expect(result.mismatchCount).toBe(1);
    expect(result.missingInTargetCount).toBe(1);
    expect(result.missingInSourceCount).toBe(1);
    expect(result.totalKeys).toBe(4);
  });

  it('returns sorted entries by key', () => {
    const result = compareEnvs(source, target);
    const keys = result.entries.map(e => e.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('handles identical envs', () => {
    const result = compareEnvs(source, source);
    expect(result.matchCount).toBe(3);
    expect(result.mismatchCount).toBe(0);
  });

  it('handles empty envs', () => {
    const result = compareEnvs({}, {});
    expect(result.totalKeys).toBe(0);
    expect(result.entries).toHaveLength(0);
  });
});
