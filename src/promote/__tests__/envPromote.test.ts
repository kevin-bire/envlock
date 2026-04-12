import { promoteEnv, getMissingInTarget } from '../envPromote';
import { ParsedEnv } from '../../parser/envParser';

describe('promoteEnv', () => {
  const source: ParsedEnv = { DB_HOST: 'prod-db', DB_PASS: 'secret', API_KEY: 'key123' };
  const makeTarget = (): ParsedEnv => ({ DB_HOST: 'staging-db', PORT: '3000' });

  it('promotes new keys to target', () => {
    const target = makeTarget();
    const result = promoteEnv(source, target);
    expect(target.API_KEY).toBe('key123');
    expect(target.DB_PASS).toBe('secret');
    expect(result.promoted).toHaveLength(2);
  });

  it('skips existing keys without overwrite', () => {
    const target = makeTarget();
    const result = promoteEnv(source, target);
    expect(target.DB_HOST).toBe('staging-db');
    expect(result.skipped).toContainEqual(
      expect.objectContaining({ key: 'DB_HOST' })
    );
  });

  it('overwrites existing keys when overwrite is true', () => {
    const target = makeTarget();
    const result = promoteEnv(source, target, { overwrite: true });
    expect(target.DB_HOST).toBe('prod-db');
    expect(result.promoted).toContainEqual(
      expect.objectContaining({ key: 'DB_HOST', fromValue: 'prod-db' })
    );
  });

  it('does not mutate target on dryRun', () => {
    const target = makeTarget();
    promoteEnv(source, target, { dryRun: true });
    expect(target.API_KEY).toBeUndefined();
    expect(target.DB_HOST).toBe('staging-db');
  });

  it('promotes only specified keys', () => {
    const target = makeTarget();
    const result = promoteEnv(source, target, { keys: ['API_KEY'] });
    expect(result.promoted).toHaveLength(1);
    expect(result.promoted[0].key).toBe('API_KEY');
    expect(target.DB_PASS).toBeUndefined();
  });

  it('skips keys not found in source', () => {
    const target = makeTarget();
    const result = promoteEnv(source, target, { keys: ['NONEXISTENT'] });
    expect(result.skipped).toContainEqual(
      expect.objectContaining({ key: 'NONEXISTENT', reason: 'key not found in source' })
    );
  });
});

describe('getMissingInTarget', () => {
  it('returns keys present in source but not in target', () => {
    const source: ParsedEnv = { A: '1', B: '2', C: '3' };
    const target: ParsedEnv = { A: '1' };
    expect(getMissingInTarget(source, target)).toEqual(['B', 'C']);
  });

  it('returns empty array when target has all source keys', () => {
    const source: ParsedEnv = { A: '1' };
    const target: ParsedEnv = { A: '1', B: '2' };
    expect(getMissingInTarget(source, target)).toEqual([]);
  });
});
