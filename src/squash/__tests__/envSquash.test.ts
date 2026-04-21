import { squashEnvs, getOverriddenKeys } from '../envSquash';

describe('squashEnvs', () => {
  it('merges a single layer unchanged', () => {
    const result = squashEnvs([{ FOO: 'bar', BAZ: 'qux' }]);
    expect(result.squashed).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(result.overriddenCount).toBe(0);
    expect(result.totalKeys).toBe(2);
  });

  it('later layers override earlier ones', () => {
    const result = squashEnvs([
      { FOO: 'base', SHARED: 'v1' },
      { SHARED: 'v2', BAR: 'new' },
    ]);
    expect(result.squashed).toEqual({ FOO: 'base', SHARED: 'v2', BAR: 'new' });
  });

  it('tracks overridden keys with source layer index', () => {
    const result = squashEnvs([
      { KEY: 'a' },
      { KEY: 'b' },
      { KEY: 'c' },
    ]);
    expect(result.overrides['KEY']).toHaveLength(2);
    expect(result.overrides['KEY'][0]).toEqual({ from: 'a', to: 'b', source: 1 });
    expect(result.overrides['KEY'][1]).toEqual({ from: 'b', to: 'c', source: 2 });
  });

  it('does not record override when value is the same', () => {
    const result = squashEnvs([
      { FOO: 'same' },
      { FOO: 'same' },
    ]);
    expect(result.overriddenCount).toBe(0);
    expect(result.overrides).toEqual({});
  });

  it('handles empty layers gracefully', () => {
    const result = squashEnvs([{}, {}, {}]);
    expect(result.squashed).toEqual({});
    expect(result.totalKeys).toBe(0);
    expect(result.overriddenCount).toBe(0);
  });

  it('handles no layers', () => {
    const result = squashEnvs([]);
    expect(result.squashed).toEqual({});
    expect(result.totalKeys).toBe(0);
  });

  it('accumulates keys from all layers', () => {
    const result = squashEnvs([
      { A: '1' },
      { B: '2' },
      { C: '3' },
    ]);
    expect(result.squashed).toEqual({ A: '1', B: '2', C: '3' });
    expect(result.totalKeys).toBe(3);
    expect(result.overriddenCount).toBe(0);
  });
});

describe('getOverriddenKeys', () => {
  it('returns keys that were overridden', () => {
    const result = squashEnvs([
      { FOO: 'a', BAR: 'x' },
      { FOO: 'b' },
    ]);
    const keys = getOverriddenKeys(result);
    expect(keys).toContain('FOO');
    expect(keys).not.toContain('BAR');
  });

  it('returns empty array when no overrides', () => {
    const result = squashEnvs([{ A: '1' }, { B: '2' }]);
    expect(getOverriddenKeys(result)).toEqual([]);
  });
});
