import { groupByPrefix, filterGroups } from '../envGroup';

describe('groupByPrefix', () => {
  const env = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    REDIS_URL: 'redis://localhost',
    APP_NAME: 'envlock',
    NODE_ENV: 'production',
    PORT: '3000',
  };

  it('groups keys by prefix', () => {
    const result = groupByPrefix(env);
    expect(result.groups['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.groups['REDIS']).toEqual({ REDIS_URL: 'redis://localhost' });
    expect(result.groups['APP']).toEqual({ APP_NAME: 'envlock' });
    expect(result.groups['NODE']).toEqual({ NODE_ENV: 'production' });
  });

  it('places keys without delimiter in ungrouped', () => {
    const result = groupByPrefix(env);
    expect(result.ungrouped).toEqual({ PORT: '3000' });
  });

  it('returns correct totals', () => {
    const result = groupByPrefix(env);
    expect(result.totalKeys).toBe(6);
    expect(result.totalGroups).toBe(4);
  });

  it('supports custom delimiter', () => {
    const dotEnv = { 'db.host': 'localhost', 'db.port': '5432', 'standalone': 'yes' };
    const result = groupByPrefix(dotEnv, '.');
    expect(result.groups['db']).toEqual({ 'db.host': 'localhost', 'db.port': '5432' });
    expect(result.ungrouped).toEqual({ standalone: 'yes' });
  });

  it('handles empty env', () => {
    const result = groupByPrefix({});
    expect(result.groups).toEqual({});
    expect(result.ungrouped).toEqual({});
    expect(result.totalKeys).toBe(0);
    expect(result.totalGroups).toBe(0);
  });
});

describe('filterGroups', () => {
  const env = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    REDIS_URL: 'redis://localhost',
    PORT: '3000',
  };

  it('filters to only specified groups', () => {
    const full = groupByPrefix(env);
    const filtered = filterGroups(full, ['DB']);
    expect(filtered.groups['DB']).toBeDefined();
    expect(filtered.groups['REDIS']).toBeUndefined();
    expect(filtered.totalGroups).toBe(1);
  });

  it('always includes ungrouped keys', () => {
    const full = groupByPrefix(env);
    const filtered = filterGroups(full, ['DB']);
    expect(filtered.ungrouped).toEqual({ PORT: '3000' });
  });

  it('handles non-existent group names gracefully', () => {
    const full = groupByPrefix(env);
    const filtered = filterGroups(full, ['NONEXISTENT']);
    expect(filtered.totalGroups).toBe(0);
    expect(filtered.groups).toEqual({});
  });
});
