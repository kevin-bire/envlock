import { upperKeys, upperValues, upperEnv } from '../envUpper';

describe('upperKeys', () => {
  it('uppercases lowercase keys', () => {
    const result = upperKeys({ foo: 'bar', baz: 'qux' });
    expect(result.env).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(result.changed).toEqual(expect.arrayContaining(['foo', 'baz']));
    expect(result.skipped).toHaveLength(0);
  });

  it('skips already uppercase keys', () => {
    const result = upperKeys({ FOO: 'bar', baz: 'qux' });
    expect(result.skipped).toContain('FOO');
    expect(result.changed).toContain('baz');
  });

  it('handles empty env', () => {
    const result = upperKeys({});
    expect(result.env).toEqual({});
    expect(result.changed).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe('upperValues', () => {
  it('uppercases lowercase values', () => {
    const result = upperValues({ FOO: 'hello', BAR: 'world' });
    expect(result.env).toEqual({ FOO: 'HELLO', BAR: 'WORLD' });
    expect(result.changed).toEqual(expect.arrayContaining(['FOO', 'BAR']));
  });

  it('skips already uppercase values', () => {
    const result = upperValues({ FOO: 'HELLO', BAR: 'world' });
    expect(result.skipped).toContain('FOO');
    expect(result.changed).toContain('BAR');
  });

  it('preserves keys unchanged', () => {
    const result = upperValues({ myKey: 'value' });
    expect(result.env).toHaveProperty('myKey', 'VALUE');
  });
});

describe('upperEnv', () => {
  it('defaults to keys', () => {
    const result = upperEnv({ foo: 'bar' });
    expect(result.env).toEqual({ FOO: 'bar' });
  });

  it('handles values target', () => {
    const result = upperEnv({ FOO: 'bar' }, 'values');
    expect(result.env).toEqual({ FOO: 'BAR' });
  });

  it('handles both target', () => {
    const result = upperEnv({ foo: 'bar' }, 'both');
    expect(result.env).toEqual({ FOO: 'BAR' });
    expect(result.changed.length).toBeGreaterThan(0);
  });

  it('reports no changes when already upper', () => {
    const result = upperEnv({ FOO: 'BAR' }, 'both');
    expect(result.changed).toHaveLength(0);
  });
});
