import { summarizeEnv } from '../envSummarize';

describe('summarizeEnv', () => {
  it('returns zeros for empty env', () => {
    const result = summarizeEnv({});
    expect(result.total).toBe(0);
    expect(result.empty).toBe(0);
    expect(result.nonEmpty).toBe(0);
    expect(result.uniqueValues).toBe(0);
    expect(result.averageValueLength).toBe(0);
    expect(result.longestKey).toBe('');
    expect(result.shortestKey).toBe('');
  });

  it('counts total, empty and nonEmpty correctly', () => {
    const env = { FOO: 'bar', BAZ: '', QUX: 'hello' };
    const result = summarizeEnv(env);
    expect(result.total).toBe(3);
    expect(result.empty).toBe(1);
    expect(result.nonEmpty).toBe(2);
  });

  it('groups keys by prefix', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp', STANDALONE: 'x' };
    const result = summarizeEnv(env);
    expect(result.prefixes['DB']).toBe(2);
    expect(result.prefixes['APP']).toBe(1);
    expect(result.prefixes['STANDALONE']).toBeUndefined();
  });

  it('identifies longest and shortest keys', () => {
    const env = { AB: '1', ABCDEFGHIJ: '2', ABCDE: '3' };
    const result = summarizeEnv(env);
    expect(result.longestKey).toBe('ABCDEFGHIJ');
    expect(result.shortestKey).toBe('AB');
  });

  it('calculates average value length', () => {
    const env = { A: 'ab', B: 'abcd' }; // lengths 2 + 4 = 6 / 2 = 3
    const result = summarizeEnv(env);
    expect(result.averageValueLength).toBe(3);
  });

  it('counts unique values', () => {
    const env = { A: 'same', B: 'same', C: 'different' };
    const result = summarizeEnv(env);
    expect(result.uniqueValues).toBe(2);
  });

  it('handles single key env', () => {
    const env = { ONLY_KEY: 'value' };
    const result = summarizeEnv(env);
    expect(result.total).toBe(1);
    expect(result.longestKey).toBe('ONLY_KEY');
    expect(result.shortestKey).toBe('ONLY_KEY');
  });
});
