import { applyDefaults, getMissingDefaults } from '../envDefaults';

describe('applyDefaults', () => {
  const defaults = { HOST: 'localhost', PORT: '3000', DEBUG: 'false' };

  it('applies defaults for missing keys', () => {
    const env = { HOST: 'example.com' };
    const result = applyDefaults(env, defaults);
    expect(result.env.HOST).toBe('example.com');
    expect(result.env.PORT).toBe('3000');
    expect(result.env.DEBUG).toBe('false');
    expect(result.applied).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);
  });

  it('does not overwrite existing values by default', () => {
    const env = { HOST: 'prod.example.com', PORT: '8080', DEBUG: 'true' };
    const result = applyDefaults(env, defaults);
    expect(result.env.HOST).toBe('prod.example.com');
    expect(result.env.PORT).toBe('8080');
    expect(result.applied).toHaveLength(0);
    expect(result.skipped).toHaveLength(3);
  });

  it('overwrites empty values when overwriteEmpty is true', () => {
    const env = { HOST: '', PORT: '8080' };
    const result = applyDefaults(env, defaults, true);
    expect(result.env.HOST).toBe('localhost');
    expect(result.env.PORT).toBe('8080');
    expect(result.applied.map((e) => e.key)).toContain('HOST');
    expect(result.applied.map((e) => e.key)).toContain('DEBUG');
  });

  it('does not overwrite empty values when overwriteEmpty is false', () => {
    const env = { HOST: '' };
    const result = applyDefaults(env, { HOST: 'localhost' }, false);
    expect(result.env.HOST).toBe('');
    expect(result.skipped).toHaveLength(1);
  });

  it('returns unchanged env when defaults is empty', () => {
    const env = { KEY: 'value' };
    const result = applyDefaults(env, {});
    expect(result.env).toEqual(env);
    expect(result.applied).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe('getMissingDefaults', () => {
  it('returns keys that are missing from env', () => {
    const env = { HOST: 'localhost' };
    const defaults = { HOST: 'localhost', PORT: '3000' };
    const missing = getMissingDefaults(env, defaults);
    expect(missing).toEqual(['PORT']);
  });

  it('returns keys with empty string values', () => {
    const env = { HOST: '', PORT: '3000' };
    const defaults = { HOST: 'localhost', PORT: '3000' };
    const missing = getMissingDefaults(env, defaults);
    expect(missing).toEqual(['HOST']);
  });

  it('returns empty array when all defaults are present', () => {
    const env = { HOST: 'localhost', PORT: '3000' };
    const defaults = { HOST: 'localhost', PORT: '3000' };
    expect(getMissingDefaults(env, defaults)).toHaveLength(0);
  });
});
