import { reorderByKeys, reorderAlphabetically, reorderEnv } from '../envReorder';

const sample = { C: '3', A: '1', B: '2' };

describe('reorderByKeys', () => {
  it('reorders according to provided key list', () => {
    const result = reorderByKeys(sample, ['A', 'B', 'C']);
    expect(Object.keys(result.reordered)).toEqual(['A', 'B', 'C']);
    expect(result.unchanged).toBe(false);
  });

  it('appends keys not in list at end', () => {
    const result = reorderByKeys(sample, ['A']);
    expect(Object.keys(result.reordered)[0]).toBe('A');
    expect(Object.keys(result.reordered)).toContain('B');
    expect(Object.keys(result.reordered)).toContain('C');
  });

  it('ignores keys in list that do not exist in env', () => {
    const result = reorderByKeys(sample, ['Z', 'A', 'B', 'C']);
    expect(Object.keys(result.reordered)).toEqual(['A', 'B', 'C']);
  });
});

describe('reorderAlphabetically', () => {
  it('sorts keys alphabetically', () => {
    const result = reorderAlphabetically(sample);
    expect(Object.keys(result.reordered)).toEqual(['A', 'B', 'C']);
  });

  it('marks unchanged when already sorted', () => {
    const sorted = { A: '1', B: '2', C: '3' };
    const result = reorderAlphabetically(sorted);
    expect(result.unchanged).toBe(true);
  });
});

describe('reorderEnv', () => {
  it('returns unchanged when no options given', () => {
    const result = reorderEnv(sample);
    expect(result.unchanged).toBe(true);
  });

  it('uses alpha option', () => {
    const result = reorderEnv(sample, { alpha: true });
    expect(Object.keys(result.reordered)).toEqual(['A', 'B', 'C']);
  });

  it('uses keys option', () => {
    const result = reorderEnv(sample, { keys: ['B', 'A', 'C'] });
    expect(Object.keys(result.reordered)).toEqual(['B', 'A', 'C']);
  });
});
