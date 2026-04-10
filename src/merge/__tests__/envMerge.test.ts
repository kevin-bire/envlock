import { mergeEnvs, getMissingKeys } from '../envMerge';

describe('mergeEnvs', () => {
  const base = { DB_HOST: 'localhost', DB_PORT: '5432', APP_ENV: 'development' };
  const override = { DB_HOST: 'prod-host', DB_PORT: '5432', NEW_KEY: 'new-value' };

  it('should merge override keys into base', () => {
    const result = mergeEnvs(base, override);
    expect(result.merged).toHaveProperty('DB_HOST', 'prod-host');
    expect(result.merged).toHaveProperty('NEW_KEY', 'new-value');
    expect(result.merged).toHaveProperty('APP_ENV', 'development');
  });

  it('should detect conflicts correctly', () => {
    const result = mergeEnvs(base, override);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]).toEqual({
      key: 'DB_HOST',
      baseValue: 'localhost',
      overrideValue: 'prod-host',
    });
  });

  it('should track added keys', () => {
    const result = mergeEnvs(base, override);
    expect(result.added).toContain('NEW_KEY');
    expect(result.added).not.toContain('DB_HOST');
  });

  it('should track overridden keys with override-wins strategy', () => {
    const result = mergeEnvs(base, override, 'override-wins');
    expect(result.overridden).toContain('DB_HOST');
  });

  it('should keep base values with base-wins strategy', () => {
    const result = mergeEnvs(base, override, 'base-wins');
    expect(result.merged).toHaveProperty('DB_HOST', 'localhost');
    expect(result.overridden).toHaveLength(0);
  });

  it('should keep base values with prompt strategy (no auto-resolution)', () => {
    const result = mergeEnvs(base, override, 'prompt');
    expect(result.merged).toHaveProperty('DB_HOST', 'localhost');
    expect(result.conflicts).toHaveLength(1);
    expect(result.overridden).toHaveLength(0);
  });

  it('should not mark equal values as conflicts', () => {
    const result = mergeEnvs(base, override);
    const conflictKeys = result.conflicts.map((c) => c.key);
    expect(conflictKeys).not.toContain('DB_PORT');
  });

  it('should handle empty override gracefully', () => {
    const result = mergeEnvs(base, {});
    expect(result.merged).toEqual(base);
    expect(result.conflicts).toHaveLength(0);
    expect(result.added).toHaveLength(0);
  });

  it('should handle empty base gracefully', () => {
    const result = mergeEnvs({}, override);
    expect(result.merged).toEqual(override);
    expect(result.conflicts).toHaveLength(0);
    expect(result.added).toEqual(Object.keys(override));
  });
});

describe('getMissingKeys', () => {
  it('should return keys in override not present in base', () => {
    const base = { A: '1', B: '2' };
    const override = { A: '1', C: '3', D: '4' };
    const missing = getMissingKeys(base, override);
    expect(missing).toContain('C');
    expect(missing).toContain('D');
    expect(missing).not.toContain('A');
  });

  it('should return empty array when override is subset of base', () => {
    const base = { A: '1', B: '2', C: '3' };
    const override = { A: '1' };
    expect(getMissingKeys(base, override)).toHaveLength(0);
  });
});
