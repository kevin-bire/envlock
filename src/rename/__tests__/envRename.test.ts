import { buildRenameMap, renameKeys } from '../envRename';

describe('buildRenameMap', () => {
  it('creates a map from a plain object', () => {
    const map = buildRenameMap({ OLD_KEY: 'NEW_KEY', FOO: 'BAR' });
    expect(map.get('OLD_KEY')).toBe('NEW_KEY');
    expect(map.get('FOO')).toBe('BAR');
  });

  it('ignores entries where from equals to', () => {
    const map = buildRenameMap({ SAME: 'SAME' });
    expect(map.has('SAME')).toBe(false);
  });

  it('ignores entries with empty keys', () => {
    const map = buildRenameMap({ '': 'DEST' });
    expect(map.size).toBe(0);
  });
});

describe('renameKeys', () => {
  const env = { OLD_KEY: 'value1', FOO: 'bar', KEEP: 'keep' };

  it('renames existing keys', () => {
    const map = buildRenameMap({ OLD_KEY: 'NEW_KEY' });
    const result = renameKeys(env, map);
    expect(result.env).toHaveProperty('NEW_KEY', 'value1');
    expect(result.env).not.toHaveProperty('OLD_KEY');
    expect(result.renamed).toBe(1);
    expect(result.skipped).toBe(0);
  });

  it('skips when source key does not exist', () => {
    const map = buildRenameMap({ MISSING: 'TARGET' });
    const result = renameKeys(env, map);
    expect(result.skipped).toBe(1);
    expect(result.operations[0].reason).toMatch(/not found/);
  });

  it('skips when target key already exists', () => {
    const map = buildRenameMap({ FOO: 'KEEP' });
    const result = renameKeys(env, map);
    expect(result.skipped).toBe(1);
    expect(result.operations[0].reason).toMatch(/already exists/);
    expect(result.env).toHaveProperty('FOO', 'bar');
  });

  it('preserves unrelated keys', () => {
    const map = buildRenameMap({ OLD_KEY: 'NEW_KEY' });
    const result = renameKeys(env, map);
    expect(result.env).toHaveProperty('FOO', 'bar');
    expect(result.env).toHaveProperty('KEEP', 'keep');
  });

  it('handles multiple renames in one pass', () => {
    const map = buildRenameMap({ OLD_KEY: 'NEW_KEY', FOO: 'BAZ' });
    const result = renameKeys(env, map);
    expect(result.renamed).toBe(2);
    expect(result.env).toHaveProperty('NEW_KEY');
    expect(result.env).toHaveProperty('BAZ');
  });

  it('returns empty env when input is empty', () => {
    const map = buildRenameMap({ OLD_KEY: 'NEW_KEY' });
    const result = renameKeys({}, map);
    expect(result.env).toEqual({});
    expect(result.skipped).toBe(1);
  });
});
