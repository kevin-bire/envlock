import {
  filterByScope,
  stripScopePrefix,
  addScopePrefix,
} from '../envScope';

const sampleEnv = {
  APP__HOST: 'localhost',
  APP__PORT: '3000',
  DB__HOST: 'db.local',
  DB__PORT: '5432',
  GLOBAL_KEY: 'value',
};

describe('filterByScope', () => {
  it('filters keys matching a single scope', () => {
    const result = filterByScope(sampleEnv, ['APP']);
    expect(result.matched).toEqual(['APP__HOST', 'APP__PORT']);
    expect(result.unmatched).toContain('DB__HOST');
    expect(result.unmatched).toContain('GLOBAL_KEY');
  });

  it('filters keys matching multiple scopes', () => {
    const result = filterByScope(sampleEnv, ['APP', 'DB']);
    expect(result.matched).toHaveLength(4);
    expect(result.unmatched).toEqual(['GLOBAL_KEY']);
  });

  it('returns empty scoped when no scope matches', () => {
    const result = filterByScope(sampleEnv, ['UNKNOWN']);
    expect(result.matched).toHaveLength(0);
    expect(result.unmatched).toHaveLength(5);
  });

  it('respects custom separator', () => {
    const env = { APP_HOST: 'localhost', APP_PORT: '3000', OTHER: 'x' };
    const result = filterByScope(env, ['APP'], '_');
    expect(result.matched).toContain('APP_HOST');
    expect(result.matched).toContain('APP_PORT');
    expect(result.unmatched).toContain('OTHER');
  });

  it('is case-insensitive for scope name', () => {
    const result = filterByScope(sampleEnv, ['app']);
    expect(result.matched).toContain('APP__HOST');
  });
});

describe('stripScopePrefix', () => {
  it('removes scope prefix from matching keys', () => {
    const env = { APP__HOST: 'localhost', APP__PORT: '3000' };
    const result = stripScopePrefix(env, 'APP');
    expect(result).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('leaves non-prefixed keys unchanged', () => {
    const env = { APP__HOST: 'localhost', OTHER: 'value' };
    const result = stripScopePrefix(env, 'APP');
    expect(result).toEqual({ HOST: 'localhost', OTHER: 'value' });
  });
});

describe('addScopePrefix', () => {
  it('adds scope prefix to all keys', () => {
    const env = { HOST: 'localhost', PORT: '3000' };
    const result = addScopePrefix(env, 'APP');
    expect(result).toEqual({ APP__HOST: 'localhost', APP__PORT: '3000' });
  });

  it('supports custom separator', () => {
    const env = { HOST: 'localhost' };
    const result = addScopePrefix(env, 'APP', '_');
    expect(result).toEqual({ APP_HOST: 'localhost' });
  });
});
