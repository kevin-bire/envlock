import { pickKeys, pickByPattern, pickEnv } from '../envPick';
import { EnvMap } from '../../parser/envParser';

const sampleEnv: EnvMap = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret',
  APP_NAME: 'envlock',
  DEBUG: 'true',
};

describe('pickKeys', () => {
  it('picks existing keys', () => {
    const result = pickKeys(sampleEnv, ['DB_HOST', 'API_KEY']);
    expect(result.picked).toEqual({ DB_HOST: 'localhost', API_KEY: 'secret' });
    expect(result.missing).toEqual([]);
    expect(result.total).toBe(2);
  });

  it('tracks missing keys', () => {
    const result = pickKeys(sampleEnv, ['DB_HOST', 'UNKNOWN']);
    expect(result.picked).toEqual({ DB_HOST: 'localhost' });
    expect(result.missing).toEqual(['UNKNOWN']);
    expect(result.total).toBe(1);
  });

  it('returns empty when no keys match', () => {
    const result = pickKeys(sampleEnv, ['FOO', 'BAR']);
    expect(result.total).toBe(0);
    expect(result.missing).toHaveLength(2);
  });
});

describe('pickByPattern', () => {
  it('picks keys matching pattern', () => {
    const result = pickByPattern(sampleEnv, '^DB_');
    expect(Object.keys(result.picked)).toEqual(['DB_HOST', 'DB_PORT']);
    expect(result.missing).toEqual([]);
  });

  it('returns empty for non-matching pattern', () => {
    const result = pickByPattern(sampleEnv, '^NOPE_');
    expect(result.total).toBe(0);
  });
});

describe('pickEnv', () => {
  it('delegates to pickKeys when no pattern given', () => {
    const result = pickEnv(sampleEnv, ['APP_NAME']);
    expect(result.picked).toEqual({ APP_NAME: 'envlock' });
  });

  it('delegates to pickByPattern when pattern given', () => {
    const result = pickEnv(sampleEnv, [], '^API_');
    expect(result.picked).toEqual({ API_KEY: 'secret' });
  });
});
