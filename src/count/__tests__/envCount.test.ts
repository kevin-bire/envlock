import { countEnv, countByPrefix } from '../envCount';
import { ParsedEnv } from '../../parser/envParser';

describe('countByPrefix', () => {
  it('counts keys grouped by prefix', () => {
    const env: ParsedEnv = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      APP_NAME: 'envlock',
      APP_ENV: 'test',
      SECRET: 'abc',
    };
    const result = countByPrefix(env);
    expect(result['DB']).toBe(2);
    expect(result['APP']).toBe(2);
    expect(result['SECRET']).toBeUndefined();
  });

  it('returns empty object for env with no prefixed keys', () => {
    const env: ParsedEnv = { FOO: 'bar', BAZ: 'qux' };
    const result = countByPrefix(env);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('countEnv', () => {
  it('counts total, empty, and nonEmpty keys', () => {
    const env: ParsedEnv = {
      KEY1: 'value',
      KEY2: '',
      KEY3: 'another',
    };
    const result = countEnv(env);
    expect(result.total).toBe(3);
    expect(result.empty).toBe(1);
    expect(result.nonEmpty).toBe(2);
  });

  it('counts commented lines from comments array', () => {
    const env: ParsedEnv = { A: '1' };
    const comments = ['# this is a comment', 'not a comment', '# another'];
    const result = countEnv(env, comments);
    expect(result.commented).toBe(2);
  });

  it('returns zero counts for empty env', () => {
    const result = countEnv({});
    expect(result.total).toBe(0);
    expect(result.empty).toBe(0);
    expect(result.nonEmpty).toBe(0);
    expect(result.commented).toBe(0);
    expect(result.byPrefix).toEqual({});
  });

  it('includes byPrefix breakdown', () => {
    const env: ParsedEnv = {
      DB_HOST: 'localhost',
      DB_PASS: 'secret',
      APP_KEY: 'xyz',
    };
    const result = countEnv(env);
    expect(result.byPrefix['DB']).toBe(2);
    expect(result.byPrefix['APP']).toBe(1);
  });
});
