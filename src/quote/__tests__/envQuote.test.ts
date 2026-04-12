import { quoteValue, unquoteValue, quoteEnv } from '../envQuote';

describe('quoteValue', () => {
  it('returns value unchanged for style none', () => {
    expect(quoteValue('hello world', 'none')).toBe('hello world');
  });

  it('wraps in single quotes for style single', () => {
    expect(quoteValue('hello', 'single')).toBe("'hello'");
  });

  it('escapes single quotes within single-quoted values', () => {
    expect(quoteValue("it's", 'single')).toBe("'it'\\''s'");
  });

  it('wraps in double quotes for style double', () => {
    expect(quoteValue('hello world', 'double')).toBe('"hello world"');
  });

  it('escapes dollar signs in double-quoted values', () => {
    expect(quoteValue('$HOME', 'double')).toBe('"\\$HOME"');
  });

  it('escapes double quotes in double-quoted values', () => {
    expect(quoteValue('say "hi"', 'double')).toBe('"say \\"hi\\""');
  });

  it('auto: does not quote plain values', () => {
    expect(quoteValue('plainvalue', 'auto')).toBe('plainvalue');
  });

  it('auto: quotes values with spaces', () => {
    expect(quoteValue('hello world', 'auto')).toBe('"hello world"');
  });

  it('auto: quotes values with hash', () => {
    expect(quoteValue('val#comment', 'auto')).toBe('"val#comment"');
  });

  it('auto: returns empty string unchanged', () => {
    expect(quoteValue('', 'auto')).toBe('');
  });
});

describe('unquoteValue', () => {
  it('removes double quotes', () => {
    expect(unquoteValue('"hello"')).toBe('hello');
  });

  it('removes single quotes', () => {
    expect(unquoteValue("'hello'")).toBe('hello');
  });

  it('returns plain value unchanged', () => {
    expect(unquoteValue('hello')).toBe('hello');
  });

  it('does not strip mismatched quotes', () => {
    expect(unquoteValue('"hello\'')).toBe('"hello\'');
  });
});

describe('quoteEnv', () => {
  const env = {
    PLAIN: 'value',
    WITH_SPACE: 'hello world',
    DOLLAR: '$SECRET',
  };

  it('applies auto quoting and records changes', () => {
    const result = quoteEnv(env, 'auto');
    expect(result.quoted['PLAIN']).toBe('value');
    expect(result.quoted['WITH_SPACE']).toBe('"hello world"');
    expect(result.quoted['DOLLAR']).toBe('"\\$SECRET"');
    expect(result.changes).toHaveLength(2);
    expect(result.changes.map((c) => c.key)).toContain('WITH_SPACE');
    expect(result.changes.map((c) => c.key)).toContain('DOLLAR');
  });

  it('applies double quoting to all values', () => {
    const result = quoteEnv({ KEY: 'val' }, 'double');
    expect(result.quoted['KEY']).toBe('"val"');
    expect(result.changes[0].reason).toContain('double');
  });

  it('preserves original values in result', () => {
    const result = quoteEnv(env, 'auto');
    expect(result.original).toEqual(env);
  });

  it('returns no changes when style is none', () => {
    const result = quoteEnv(env, 'none');
    expect(result.changes).toHaveLength(0);
    expect(result.quoted).toEqual(env);
  });
});
