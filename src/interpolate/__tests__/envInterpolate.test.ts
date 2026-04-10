import { interpolateEnv, resolveValue } from '../envInterpolate';

describe('resolveValue', () => {
  it('returns the raw value when no references exist', () => {
    const env = { HOST: 'localhost' };
    const result = resolveValue('HOST', env);
    expect(result.value).toBe('localhost');
    expect(result.unresolved).toEqual([]);
    expect(result.cycle).toBe(false);
  });

  it('resolves ${VAR} style references', () => {
    const env = { HOST: 'localhost', URL: 'http://${HOST}:3000' };
    const result = resolveValue('URL', env);
    expect(result.value).toBe('http://localhost:3000');
  });

  it('resolves $VAR style references', () => {
    const env = { PORT: '8080', ADDR: '$PORT' };
    const result = resolveValue('ADDR', env);
    expect(result.value).toBe('8080');
  });

  it('reports unresolved references', () => {
    const env = { URL: 'http://${MISSING}' };
    const result = resolveValue('URL', env);
    expect(result.unresolved).toContain('MISSING');
  });

  it('detects cyclic references', () => {
    const env = { A: '${B}', B: '${A}' };
    const result = resolveValue('A', env, new Set(['A']));
    expect(result.cycle).toBe(true);
  });
});

describe('interpolateEnv', () => {
  it('interpolates all variables in env', () => {
    const env = { BASE: 'http://api.example.com', URL: '${BASE}/v1' };
    const { interpolated, unresolved, cycles } = interpolateEnv(env);
    expect(interpolated['URL']).toBe('http://api.example.com/v1');
    expect(unresolved).toHaveLength(0);
    expect(cycles).toHaveLength(0);
  });

  it('collects unresolved keys', () => {
    const env = { URL: '${MISSING_VAR}/path' };
    const { unresolved } = interpolateEnv(env, { allowMissing: true });
    expect(unresolved).toContain('MISSING_VAR');
  });

  it('throws when allowMissing is false and ref is missing', () => {
    const env = { URL: '${GHOST}' };
    expect(() => interpolateEnv(env, { allowMissing: false })).toThrow(/Unresolved/);
  });

  it('handles env with no interpolation needed', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const { interpolated } = interpolateEnv(env);
    expect(interpolated).toEqual(env);
  });

  it('chains multiple references', () => {
    const env = { A: 'hello', B: '${A} world', C: '${B}!' };
    const { interpolated } = interpolateEnv(env);
    expect(interpolated['C']).toBe('hello world!');
  });

  it('deduplicates unresolved keys', () => {
    const env = { X: '${GHOST}', Y: '${GHOST}' };
    const { unresolved } = interpolateEnv(env);
    expect(unresolved.filter((k) => k === 'GHOST')).toHaveLength(1);
  });
});
