import { applyPatch, parsePatchFile, PatchOperation } from '../envPatch';

describe('applyPatch', () => {
  const base = { API_KEY: 'abc', DB_HOST: 'localhost', PORT: '3000' };

  it('applies set operation', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'PORT', value: '8080' }];
    const result = applyPatch(base, ops);
    expect(result.patched.PORT).toBe('8080');
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
  });

  it('applies set to new key', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'NEW_KEY', value: 'hello' }];
    const result = applyPatch(base, ops);
    expect(result.patched.NEW_KEY).toBe('hello');
  });

  it('applies delete operation', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'PORT' }];
    const result = applyPatch(base, ops);
    expect(result.patched.PORT).toBeUndefined();
    expect(result.applied).toHaveLength(1);
  });

  it('skips delete for missing key', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'MISSING' }];
    const result = applyPatch(base, ops);
    expect(result.skipped).toHaveLength(1);
    expect(result.applied).toHaveLength(0);
  });

  it('applies rename operation', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'DB_HOST', newKey: 'DATABASE_HOST' }];
    const result = applyPatch(base, ops);
    expect(result.patched.DATABASE_HOST).toBe('localhost');
    expect(result.patched.DB_HOST).toBeUndefined();
  });

  it('skips rename for missing key', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'GHOST', newKey: 'SPIRIT' }];
    const result = applyPatch(base, ops);
    expect(result.skipped).toHaveLength(1);
  });

  it('does not mutate original env', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'PORT' }];
    applyPatch(base, ops);
    expect(base.PORT).toBe('3000');
  });
});

describe('parsePatchFile', () => {
  it('parses SET directive', () => {
    const ops = parsePatchFile('SET API_KEY newsecret');
    expect(ops).toEqual([{ op: 'set', key: 'API_KEY', value: 'newsecret' }]);
  });

  it('parses DELETE directive', () => {
    const ops = parsePatchFile('DELETE OLD_KEY');
    expect(ops).toEqual([{ op: 'delete', key: 'OLD_KEY' }]);
  });

  it('parses RENAME directive', () => {
    const ops = parsePatchFile('RENAME DB_HOST DATABASE_HOST');
    expect(ops).toEqual([{ op: 'rename', key: 'DB_HOST', newKey: 'DATABASE_HOST' }]);
  });

  it('skips comment lines', () => {
    const ops = parsePatchFile('# this is a comment\nSET FOO bar');
    expect(ops).toHaveLength(1);
  });

  it('skips empty lines', () => {
    const ops = parsePatchFile('\n\nSET X y\n\n');
    expect(ops).toHaveLength(1);
  });

  it('parses multiple operations', () => {
    const content = 'SET A 1\nDELETE B\nRENAME C D';
    const ops = parsePatchFile(content);
    expect(ops).toHaveLength(3);
  });
});
