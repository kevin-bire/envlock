import { renameKeys, buildRenameMap, RenameResult } from '../envRename';
import { EnvMap } from '../../parser/envParser';

describe('buildRenameMap', () => {
  it('parses valid pairs', () => {
    const map = buildRenameMap(['OLD_KEY:NEW_KEY', 'FOO:BAR']);
    expect(map.get('OLD_KEY')).toBe('NEW_KEY');
    expect(map.get('FOO')).toBe('BAR');
  });

  it('throws on missing colon', () => {
    expect(() => buildRenameMap(['BADPAIR'])).toThrow('Invalid rename pair');
  });

  it('throws on empty side', () => {
    expect(() => buildRenameMap([':NEW'])).toThrow('Invalid rename pair');
    expect(() => buildRenameMap(['OLD:'])).toThrow('Invalid rename pair');
  });
});

describe('renameKeys', () => {
  const env: EnvMap = { FOO: 'foo_val', BAR: 'bar_val', KEEP: 'keep_val' };

  it('renames existing keys', () => {
    const map = new Map([['FOO', 'FOO_RENAMED']]);
    const result: RenameResult = renameKeys(env, map);
    expect(result.env['FOO_RENAMED']).toBe('foo_val');
    expect(result.env['FOO']).toBeUndefined();
    expect(result.renamed).toBe(1);
    expect(result.skipped).toBe(0);
  });

  it('skips missing source keys', () => {
    const map = new Map([['MISSING', 'TARGET']]);
    const result = renameKeys(env, map);
    expect(result.skipped).toBe(1);
    expect(result.operations[0].reason).toBe('key not found');
  });

  it('skips if target key exists and overwrite is false', () => {
    const map = new Map([['FOO', 'BAR']]);
    const result = renameKeys(env, map, false);
    expect(result.skipped).toBe(1);
    expect(result.operations[0].reason).toContain('already exists');
  });

  it('overwrites target key when overwrite is true', () => {
    const map = new Map([['FOO', 'BAR']]);
    const result = renameKeys(env, map, true);
    expect(result.env['BAR']).toBe('foo_val');
    expect(result.renamed).toBe(1);
  });

  it('preserves unaffected keys', () => {
    const map = new Map([['FOO', 'FOO2']]);
    const result = renameKeys(env, map);
    expect(result.env['KEEP']).toBe('keep_val');
    expect(result.env['BAR']).toBe('bar_val');
  });

  it('handles multiple renames', () => {
    const map = new Map([['FOO', 'FOO2'], ['BAR', 'BAR2']]);
    const result = renameKeys(env, map);
    expect(result.renamed).toBe(2);
    expect(result.env['FOO2']).toBe('foo_val');
    expect(result.env['BAR2']).toBe('bar_val');
  });
});
