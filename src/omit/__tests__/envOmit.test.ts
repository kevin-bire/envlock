import { omitKeys, omitByPattern, omitEnv } from '../envOmit';
import { EnvMap } from '../../parser/envParser';

const baseEnv: EnvMap = {
  APP_NAME: 'envlock',
  APP_SECRET: 'supersecret',
  DB_HOST: 'localhost',
  DB_PASS: 'dbpass',
  DEBUG: 'true',
};

describe('omitKeys', () => {
  it('removes specified keys from env', () => {
    const result = omitKeys(baseEnv, ['APP_SECRET', 'DB_PASS']);
    expect(result.result).not.toHaveProperty('APP_SECRET');
    expect(result.result).not.toHaveProperty('DB_PASS');
    expect(result.omitted).toEqual(['APP_SECRET', 'DB_PASS']);
    expect(result.notFound).toEqual([]);
  });

  it('tracks keys that are not present in env', () => {
    const result = omitKeys(baseEnv, ['MISSING_KEY']);
    expect(result.notFound).toContain('MISSING_KEY');
    expect(result.omitted).toHaveLength(0);
  });

  it('does not mutate the original env', () => {
    omitKeys(baseEnv, ['DEBUG']);
    expect(baseEnv).toHaveProperty('DEBUG');
  });

  it('returns full env when keys array is empty', () => {
    const result = omitKeys(baseEnv, []);
    expect(result.result).toEqual(baseEnv);
    expect(result.omitted).toHaveLength(0);
  });
});

describe('omitByPattern', () => {
  it('removes keys matching a pattern', () => {
    const result = omitByPattern(baseEnv, ['^DB_']);
    expect(result.result).not.toHaveProperty('DB_HOST');
    expect(result.result).not.toHaveProperty('DB_PASS');
    expect(result.omitted).toEqual(expect.arrayContaining(['DB_HOST', 'DB_PASS']));
  });

  it('removes keys matching multiple patterns', () => {
    const result = omitByPattern(baseEnv, ['^APP_', '^DEBUG']);
    expect(result.omitted).toEqual(expect.arrayContaining(['APP_NAME', 'APP_SECRET', 'DEBUG']));
    expect(Object.keys(result.result)).toEqual(['DB_HOST', 'DB_PASS']);
  });

  it('returns full env when no patterns match', () => {
    const result = omitByPattern(baseEnv, ['^NOMATCH_']);
    expect(result.result).toEqual(baseEnv);
    expect(result.omitted).toHaveLength(0);
  });
});

describe('omitEnv', () => {
  it('combines key and pattern omission', () => {
    const result = omitEnv(baseEnv, ['DEBUG'], ['^DB_']);
    expect(result.result).not.toHaveProperty('DEBUG');
    expect(result.result).not.toHaveProperty('DB_HOST');
    expect(result.result).not.toHaveProperty('DB_PASS');
    expect(result.result).toHaveProperty('APP_NAME');
  });

  it('works with only keys provided', () => {
    const result = omitEnv(baseEnv, ['DEBUG']);
    expect(result.omitted).toContain('DEBUG');
    expect(Object.keys(result.result)).toHaveLength(4);
  });

  it('works with only patterns provided', () => {
    const result = omitEnv(baseEnv, [], ['^APP_']);
    expect(result.omitted).toEqual(expect.arrayContaining(['APP_NAME', 'APP_SECRET']));
  });

  it('returns unchanged env when no keys or patterns given', () => {
    const result = omitEnv(baseEnv);
    expect(result.result).toEqual(baseEnv);
  });
});
