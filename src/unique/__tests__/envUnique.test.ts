import { findDuplicateValues, uniqueEnv } from '../envUnique';

describe('findDuplicateValues', () => {
  it('returns empty object when no duplicates', () => {
    const env = { A: 'foo', B: 'bar', C: 'baz' };
    expect(findDuplicateValues(env)).toEqual({});
  });

  it('detects a single duplicate value', () => {
    const env = { A: 'hello', B: 'hello', C: 'world' };
    const result = findDuplicateValues(env);
    expect(result['hello']).toEqual(['A', 'B']);
    expect(result['world']).toBeUndefined();
  });

  it('detects multiple duplicate values', () => {
    const env = { A: 'x', B: 'x', C: 'y', D: 'y', E: 'z' };
    const result = findDuplicateValues(env);
    expect(result['x']).toEqual(['A', 'B']);
    expect(result['y']).toEqual(['C', 'D']);
    expect(result['z']).toBeUndefined();
  });

  it('handles three keys sharing the same value', () => {
    const env = { A: 'same', B: 'same', C: 'same' };
    const result = findDuplicateValues(env);
    expect(result['same']).toEqual(['A', 'B', 'C']);
  });

  it('handles empty env', () => {
    expect(findDuplicateValues({})).toEqual({});
  });
});

describe('uniqueEnv', () => {
  it('keeps all keys when all values are unique', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = uniqueEnv(env);
    expect(result.unique).toEqual(env);
    expect(result.duplicateValues).toEqual({});
  });

  it('removes second occurrence of duplicate value', () => {
    const env = { A: 'hello', B: 'hello', C: 'world' };
    const result = uniqueEnv(env);
    expect(result.unique).toEqual({ A: 'hello', C: 'world' });
    expect(Object.keys(result.unique)).not.toContain('B');
  });

  it('preserves first key when multiple keys share a value', () => {
    const env = { X: 'dup', Y: 'dup', Z: 'dup' };
    const result = uniqueEnv(env);
    expect(Object.keys(result.unique)).toEqual(['X']);
    expect(result.unique['X']).toBe('dup');
  });

  it('returns original env reference', () => {
    const env = { A: 'v1' };
    const result = uniqueEnv(env);
    expect(result.original).toBe(env);
  });

  it('handles empty env', () => {
    const result = uniqueEnv({});
    expect(result.unique).toEqual({});
    expect(result.duplicateValues).toEqual({});
  });
});
