import { renameKeys, buildRenameMap, RenameOperation } from '../envRename';
import { ParsedEnv } from '../../parser/envParser';

describe('renameKeys', () => {
  const baseEnv: ParsedEnv = {
    OLD_KEY: 'value1',
    ANOTHER_KEY: 'value2',
    EXISTING_NEW: 'value3',
  };

  it('renames a key successfully', () => {
    const ops: RenameOperation[] = [{ oldKey: 'OLD_KEY', newKey: 'NEW_KEY' }];
    const result = renameKeys(baseEnv, ops);
    expect(result.renamed).toHaveLength(1);
    expect(result.output['NEW_KEY']).toBe('value1');
    expect(result.output['OLD_KEY']).toBeUndefined();
  });

  it('marks operation as notFound when source key is missing', () => {
    const ops: RenameOperation[] = [{ oldKey: 'MISSING_KEY', newKey: 'NEW_KEY' }];
    const result = renameKeys(baseEnv, ops);
    expect(result.notFound).toHaveLength(1);
    expect(result.renamed).toHaveLength(0);
  });

  it('skips rename when target key already exists', () => {
    const ops: RenameOperation[] = [{ oldKey: 'OLD_KEY', newKey: 'EXISTING_NEW' }];
    const result = renameKeys(baseEnv, ops);
    expect(result.skipped).toHaveLength(1);
    expect(result.output['OLD_KEY']).toBe('value1');
  });

  it('handles multiple operations', () => {
    const ops: RenameOperation[] = [
      { oldKey: 'OLD_KEY', newKey: 'NEW_KEY' },
      { oldKey: 'ANOTHER_KEY', newKey: 'RENAMED_KEY' },
    ];
    const result = renameKeys(baseEnv, ops);
    expect(result.renamed).toHaveLength(2);
    expect(result.output['NEW_KEY']).toBe('value1');
    expect(result.output['RENAMED_KEY']).toBe('value2');
  });

  it('does not mutate the original env', () => {
    const ops: RenameOperation[] = [{ oldKey: 'OLD_KEY', newKey: 'NEW_KEY' }];
    renameKeys(baseEnv, ops);
    expect(baseEnv['OLD_KEY']).toBe('value1');
  });
});

describe('buildRenameMap', () => {
  it('parses valid pairs', () => {
    const result = buildRenameMap(['OLD:NEW', 'FOO:BAR']);
    expect(result).toEqual([
      { oldKey: 'OLD', newKey: 'NEW' },
      { oldKey: 'FOO', newKey: 'BAR' },
    ]);
  });

  it('throws on invalid pair format', () => {
    expect(() => buildRenameMap(['INVALID'])).toThrow(
      'Invalid rename pair "INVALID"'
    );
  });

  it('trims whitespace from keys', () => {
    const result = buildRenameMap([' OLD : NEW ']);
    expect(result[0]).toEqual({ oldKey: 'OLD', newKey: 'NEW' });
  });
});
