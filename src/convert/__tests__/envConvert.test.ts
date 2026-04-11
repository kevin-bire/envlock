import { convertEnv, fromJson, fromShell, toShellExports } from '../envConvert';

describe('convertEnv', () => {
  const sampleEnv = { APP_NAME: 'myapp', PORT: '3000', DEBUG: 'true' };

  it('converts to JSON format', () => {
    const result = convertEnv(sampleEnv, 'json');
    expect(result.format).toBe('json');
    expect(result.keyCount).toBe(3);
    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual(sampleEnv);
  });

  it('converts to YAML format', () => {
    const result = convertEnv(sampleEnv, 'yaml');
    expect(result.format).toBe('yaml');
    expect(result.output).toContain('APP_NAME: "myapp"');
    expect(result.output).toContain('PORT: "3000"');
  });

  it('converts to shell export format', () => {
    const result = convertEnv(sampleEnv, 'shell');
    expect(result.format).toBe('shell');
    expect(result.output).toContain('export APP_NAME=myapp');
    expect(result.output).toContain('export PORT=3000');
  });

  it('converts to dotenv format', () => {
    const result = convertEnv({ GREETING: 'hello world' }, 'dotenv');
    expect(result.output).toContain('GREETING="hello world"');
  });

  it('throws on unsupported format', () => {
    expect(() => convertEnv(sampleEnv, 'xml' as any)).toThrow('Unsupported format');
  });
});

describe('fromJson', () => {
  it('parses valid JSON object', () => {
    const input = JSON.stringify({ KEY: 'value', NUM: 42 });
    const result = fromJson(input);
    expect(result).toEqual({ KEY: 'value', NUM: '42' });
  });

  it('throws on invalid JSON', () => {
    expect(() => fromJson('not json')).toThrow('Invalid JSON input');
  });

  it('throws on non-object JSON', () => {
    expect(() => fromJson('["a","b"]')).toThrow('Invalid JSON input');
  });
});

describe('fromShell', () => {
  it('parses export statements', () => {
    const input = 'export FOO=bar\nexport BAZ=qux';
    expect(fromShell(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('strips quotes from values', () => {
    const input = "export KEY='my value'";
    expect(fromShell(input)).toEqual({ KEY: 'my value' });
  });

  it('ignores lines without equals sign', () => {
    const input = 'export FOO=bar\n# comment\n\nBAZ=qux';
    const result = fromShell(input);
    expect(result['FOO']).toBe('bar');
    expect(result['BAZ']).toBe('qux');
  });
});

describe('toShellExports', () => {
  it('wraps values with spaces in single quotes', () => {
    const result = toShellExports({ MSG: 'hello world' });
    expect(result).toContain("export MSG='hello world'");
  });

  it('does not quote simple values', () => {
    const result = toShellExports({ PORT: '3000' });
    expect(result).toBe('export PORT=3000');
  });
});
