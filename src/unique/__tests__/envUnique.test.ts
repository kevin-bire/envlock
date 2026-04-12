import { findDuplicateValues, uniqueEnv } from '../envUnique';

describe('findDuplicateValues', () => {
  it('returns empty array when no duplicate values exist', () => {
    const env = { A: 'foo', B: 'bar', C: 'baz' };
    expect(findDuplicateValues(env)).toEqual([]);
  });

  it('detects keys sharing the same value', () => {
    const env = { A: 'same', B: 'same', C: 'other' };
    const result = findDuplicateValues(env);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('same');
    expect(result[0].keys).toEqual(expect.arrayContaining(['A', 'B']));
  });

  it('handles multiple groups of duplicate values', () => {
    const env = { A: 'x', B: 'x', C: 'y', D: 'y' };
    const result = findDuplicateValues(env);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty env', () => {
    expect(findDuplicateValues({})).toEqual([]);
  });
});

describe('uniqueEnv', () => {
  it('returns all keys when all values are unique', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = uniqueEnv(env);
    expect(result.uniqueCount).toBe(3);
    expect(result.duplicateCount).toBe(0);
    expect(result.duplicateValues).toHaveLength(0);
  });

  it('excludes duplicate-value keys beyond the first occurrence', () => {
    const env = { A: 'shared', B: 'shared', C: 'unique' };
    const result = uniqueEnv(env);
    expect(result.totalKeys).toBe(3);
    expect(result.duplicateCount).toBe(1);
    expect(result.uniqueCount).toBe(2);
    expect(result.unique).toHaveProperty('C', 'unique');
  });

  it('reports correct totals for empty env', () => {
    const result = uniqueEnv({});
    expect(result.totalKeys).toBe(0);
    expect(result.uniqueCount).toBe(0);
    expect(result.duplicateCount).toBe(0);
  });

  it('keeps first key of duplicate group in unique result', () => {
    const env = { FIRST: 'val', SECOND: 'val', THIRD: 'other' };
    const result = uniqueEnv(env);
    expect(Object.keys(result.unique)).toContain('FIRST');
    expect(Object.keys(result.unique)).not.toContain('SECOND');
  });
});
