import { truncateValue, shouldTruncate, truncateEnv } from '../envTruncate';

describe('truncateValue', () => {
  it('returns value unchanged when within maxLength', () => {
    expect(truncateValue('hello', 10)).toBe('hello');
  });

  it('truncates value and appends default suffix', () => {
    expect(truncateValue('hello world', 8)).toBe('hello...');
  });

  it('uses custom suffix', () => {
    expect(truncateValue('hello world', 7, '--')).toBe('hello--');
  });

  it('handles maxLength smaller than suffix', () => {
    expect(truncateValue('hello', 2, '...')).toBe('...');
  });

  it('returns empty string when maxLength is 0', () => {
    expect(truncateValue('hello', 0, '')).toBe('');
  });
});

describe('shouldTruncate', () => {
  it('returns true when no keys or pattern specified', () => {
    expect(shouldTruncate('ANY_KEY')).toBe(true);
  });

  it('returns true when key is in keys list', () => {
    expect(shouldTruncate('API_KEY', ['API_KEY', 'SECRET'])).toBe(true);
  });

  it('returns false when key not in keys list', () => {
    expect(shouldTruncate('OTHER_KEY', ['API_KEY'])).toBe(false);
  });

  it('returns true when key matches pattern', () => {
    expect(shouldTruncate('DB_PASSWORD', undefined, /PASSWORD/)).toBe(true);
  });

  it('returns false when key does not match pattern', () => {
    expect(shouldTruncate('DB_HOST', undefined, /PASSWORD/)).toBe(false);
  });
});

describe('truncateEnv', () => {
  const env = {
    SHORT: 'hi',
    LONG_VALUE: 'this is a very long environment variable value',
    SECRET_TOKEN: 'abcdefghijklmnopqrstuvwxyz',
  };

  it('truncates all values by default', () => {
    const result = truncateEnv(env, { maxLength: 10 });
    expect(result.env['SHORT']).toBe('hi');
    expect(result.env['LONG_VALUE']).toBe('this is...');
    expect(result.changes).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
  });

  it('only truncates specified keys', () => {
    const result = truncateEnv(env, { maxLength: 10, keys: ['SECRET_TOKEN'] });
    expect(result.env['LONG_VALUE']).toBe(env['LONG_VALUE']);
    expect(result.env['SECRET_TOKEN']).toBe('abcdefg...');
    expect(result.changes).toHaveLength(1);
    expect(result.skipped).toContain('SHORT');
    expect(result.skipped).toContain('LONG_VALUE');
  });

  it('truncates keys matching pattern', () => {
    const result = truncateEnv(env, { maxLength: 10, pattern: /^LONG/ });
    expect(result.env['LONG_VALUE']).toBe('this is...');
    expect(result.env['SHORT']).toBe('hi');
    expect(result.changes).toHaveLength(1);
  });

  it('uses custom suffix', () => {
    const result = truncateEnv(env, { maxLength: 10, suffix: '~~' });
    expect(result.env['LONG_VALUE']).toBe('this is ~~');
  });

  it('records no changes when all values are within limit', () => {
    const result = truncateEnv({ A: 'x', B: 'y' }, { maxLength: 100 });
    expect(result.changes).toHaveLength(0);
  });
});
