import { applyAliases, buildReverseAliasMap, stripAliases } from '../envAlias';
import { EnvMap } from '../../parser/envParser';

describe('applyAliases', () => {
  const env: EnvMap = {
    DATABASE_URL: 'postgres://localhost/db',
    API_KEY: 'secret123',
    PORT: '3000',
  };

  it('applies aliases for existing keys', () => {
    const result = applyAliases(env, { DB_URL: 'DATABASE_URL' });
    expect(result.output['DB_URL']).toBe('postgres://localhost/db');
    expect(result.applied).toHaveLength(1);
    expect(result.applied[0]).toMatchObject({ alias: 'DB_URL', original: 'DATABASE_URL' });
  });

  it('records missing source keys', () => {
    const result = applyAliases(env, { ALIAS: 'NONEXISTENT' });
    expect(result.missing).toContain('NONEXISTENT');
    expect(result.applied).toHaveLength(0);
    expect(result.output['ALIAS']).toBeUndefined();
  });

  it('records conflicts when alias key already exists', () => {
    const result = applyAliases(env, { PORT: 'DATABASE_URL' });
    expect(result.conflicts).toContain('PORT');
    expect(result.applied).toHaveLength(0);
    // original PORT value preserved
    expect(result.output['PORT']).toBe('3000');
  });

  it('handles multiple aliases at once', () => {
    const result = applyAliases(env, {
      DB: 'DATABASE_URL',
      KEY: 'API_KEY',
    });
    expect(result.applied).toHaveLength(2);
    expect(result.output['DB']).toBe('postgres://localhost/db');
    expect(result.output['KEY']).toBe('secret123');
  });

  it('preserves original keys in output', () => {
    const result = applyAliases(env, { DB_URL: 'DATABASE_URL' });
    expect(result.output['DATABASE_URL']).toBe('postgres://localhost/db');
  });
});

describe('buildReverseAliasMap', () => {
  it('maps originals to their aliases', () => {
    const reverse = buildReverseAliasMap({
      DB_URL: 'DATABASE_URL',
      DB: 'DATABASE_URL',
      KEY: 'API_KEY',
    });
    expect(reverse['DATABASE_URL']).toEqual(['DB_URL', 'DB']);
    expect(reverse['API_KEY']).toEqual(['KEY']);
  });

  it('returns empty map for empty aliases', () => {
    expect(buildReverseAliasMap({})).toEqual({});
  });
});

describe('stripAliases', () => {
  it('removes alias keys from env', () => {
    const env: EnvMap = { DATABASE_URL: 'x', DB_URL: 'x', PORT: '3000' };
    const result = stripAliases(env, { DB_URL: 'DATABASE_URL' });
    expect(result['DB_URL']).toBeUndefined();
    expect(result['DATABASE_URL']).toBe('x');
    expect(result['PORT']).toBe('3000');
  });

  it('returns full env when no aliases defined', () => {
    const env: EnvMap = { A: '1', B: '2' };
    expect(stripAliases(env, {})).toEqual(env);
  });
});
