import { needsWrapping, wrapValue, unwrapValue, wrapEnv } from '../envWrap';

describe('needsWrapping', () => {
  it('returns false for already quoted value', () => {
    expect(needsWrapping('"hello world"', '"')).toBe(false);
  });

  it('returns true for value with spaces', () => {
    expect(needsWrapping('hello world', '"')).toBe(true);
  });

  it('returns true for value with leading/trailing whitespace', () => {
    expect(needsWrapping(' hello', '"')).toBe(true);
  });

  it('returns true for value with hash', () => {
    expect(needsWrapping('val#comment', '"')).toBe(true);
  });

  it('returns true for value with dollar sign', () => {
    expect(needsWrapping('$VAR', '"')).toBe(true);
  });

  it('returns false for plain alphanumeric value', () => {
    expect(needsWrapping('simplevalue123', '"')).toBe(false);
  });
});

describe('wrapValue', () => {
  it('wraps with double quotes by default', () => {
    expect(wrapValue('hello world')).toBe('"hello world"');
  });

  it('wraps with single quotes when specified', () => {
    expect(wrapValue('hello world', "'" )).toBe("'hello world'");
  });

  it('escapes inner double quotes', () => {
    expect(wrapValue('say "hi"')).toBe('"say \\"hi\\""');
  });

  it('escapes inner single quotes', () => {
    expect(wrapValue("it's", "'")).toBe("'it\\'s'");
  });
});

describe('unwrapValue', () => {
  it('removes double quotes', () => {
    expect(unwrapValue('"hello"')).toBe('hello');
  });

  it('removes single quotes', () => {
    expect(unwrapValue("'hello'")).toBe('hello');
  });

  it('returns value unchanged if not quoted', () => {
    expect(unwrapValue('hello')).toBe('hello');
  });
});

describe('wrapEnv', () => {
  const env = {
    SIMPLE: 'value',
    SPACED: 'hello world',
    HASHED: 'val#1',
    PLAIN: 'nospecial',
  };

  it('wraps only values that need wrapping', () => {
    const result = wrapEnv(env);
    expect(result.env['SPACED']).toBe('"hello world"');
    expect(result.env['HASHED']).toBe('"val#1"');
    expect(result.env['SIMPLE']).toBe('value');
    expect(result.env['PLAIN']).toBe('nospecial');
  });

  it('records changes for wrapped values', () => {
    const result = wrapEnv(env);
    expect(result.changes.length).toBe(2);
    expect(result.changes.map(c => c.key)).toContain('SPACED');
  });

  it('records unchanged keys', () => {
    const result = wrapEnv(env);
    expect(result.unchanged).toContain('SIMPLE');
    expect(result.unchanged).toContain('PLAIN');
  });

  it('force-quotes all values when forceQuote is true', () => {
    const result = wrapEnv({ A: 'plain', B: 'also' }, { forceQuote: true });
    expect(result.changes.length).toBe(2);
    expect(result.env['A']).toBe('"plain"');
    expect(result.changes[0].reason).toBe('force-quoted');
  });

  it('uses single quote char when specified', () => {
    const result = wrapEnv({ KEY: 'has space' }, { quoteChar: "'" });
    expect(result.env['KEY']).toBe("'has space'");
  });
});
