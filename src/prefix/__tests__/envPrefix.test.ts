import { addPrefix, removePrefix } from '../envPrefix';
import { formatPrefixResult, formatPrefixSummary } from '../prefixFormatter';

describe('addPrefix', () => {
  it('should add prefix to all keys that lack it', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const result = addPrefix(env, 'APP_');

    expect(result.env).toEqual({ APP_FOO: 'bar', APP_BAZ: 'qux' });
    expect(Object.keys(result.updated)).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
  });

  it('should skip keys that already have the prefix', () => {
    const env = { APP_FOO: 'bar', BAZ: 'qux' };
    const result = addPrefix(env, 'APP_');

    expect(result.env).toEqual({ APP_FOO: 'bar', APP_BAZ: 'qux' });
    expect(result.skipped).toContain('APP_FOO');
    expect(Object.keys(result.updated)).toHaveLength(1);
  });

  it('should return unchanged env if all keys already prefixed', () => {
    const env = { APP_FOO: '1', APP_BAR: '2' };
    const result = addPrefix(env, 'APP_');

    expect(result.updated).toEqual({});
    expect(result.skipped).toHaveLength(2);
  });
});

describe('removePrefix', () => {
  it('should remove prefix from matching keys', () => {
    const env = { APP_FOO: 'bar', APP_BAZ: 'qux' };
    const result = removePrefix(env, 'APP_');

    expect(result.env).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(Object.keys(result.updated)).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
  });

  it('should skip keys without the prefix', () => {
    const env = { APP_FOO: 'bar', OTHER: 'val' };
    const result = removePrefix(env, 'APP_');

    expect(result.env).toEqual({ FOO: 'bar', OTHER: 'val' });
    expect(result.skipped).toContain('OTHER');
  });

  it('should return unchanged env if no keys have the prefix', () => {
    const env = { FOO: '1', BAR: '2' };
    const result = removePrefix(env, 'APP_');

    expect(result.updated).toEqual({});
    expect(result.skipped).toHaveLength(2);
  });
});

describe('formatPrefixResult', () => {
  it('should mask values by default', () => {
    const env = { FOO: 'secret' };
    const result = addPrefix(env, 'APP_');
    const output = formatPrefixResult(result, 'add', 'APP_');

    expect(output).toContain('APP_');
    expect(output).toContain('****');
    expect(output).not.toContain('secret');
  });

  it('should show values when mask is false', () => {
    const env = { FOO: 'secret' };
    const result = addPrefix(env, 'APP_');
    const output = formatPrefixResult(result, 'add', 'APP_', false);

    expect(output).toContain('secret');
  });
});

describe('formatPrefixSummary', () => {
  it('should summarize add operation', () => {
    const env = { FOO: '1', BAR: '2' };
    const result = addPrefix(env, 'APP_');
    const summary = formatPrefixSummary(result, 'add');

    expect(summary).toContain('2 key(s) prefixed');
    expect(summary).toContain('0 skipped');
  });

  it('should summarize remove operation', () => {
    const env = { APP_FOO: '1', OTHER: '2' };
    const result = removePrefix(env, 'APP_');
    const summary = formatPrefixSummary(result, 'remove');

    expect(summary).toContain('1 key(s) unprefixed');
    expect(summary).toContain('1 skipped');
  });
});
