import { freezeKeys, checkFreezeDrift } from '../envFreeze';
import { ParsedEnv } from '../../parser/envParser';

describe('freezeKeys', () => {
  const env: ParsedEnv = {
    API_KEY: 'secret123',
    DB_HOST: 'localhost',
    PORT: '3000',
  };

  it('freezes keys that exist in the env', () => {
    const { store, result } = freezeKeys(env, ['API_KEY', 'DB_HOST']);
    expect(result.frozenCount).toBe(2);
    expect(result.skippedCount).toBe(0);
    expect(store.keys['API_KEY']).toBe('secret123');
    expect(store.keys['DB_HOST']).toBe('localhost');
    expect(store.frozenAt).toBeTruthy();
  });

  it('skips keys that do not exist in the env', () => {
    const { result } = freezeKeys(env, ['MISSING_KEY']);
    expect(result.frozenCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(result.skipped).toContain('MISSING_KEY');
  });

  it('handles mixed existing and missing keys', () => {
    const { store, result } = freezeKeys(env, ['API_KEY', 'UNKNOWN']);
    expect(result.frozenCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(store.keys['API_KEY']).toBe('secret123');
  });

  it('returns an empty store when no keys provided', () => {
    const { store, result } = freezeKeys(env, []);
    expect(result.frozenCount).toBe(0);
    expect(Object.keys(store.keys)).toHaveLength(0);
  });
});

describe('checkFreezeDrift', () => {
  const store = {
    keys: { API_KEY: 'secret123', DB_HOST: 'localhost' },
    frozenAt: new Date().toISOString(),
  };

  it('reports clean when all frozen values match', () => {
    const env: ParsedEnv = { API_KEY: 'secret123', DB_HOST: 'localhost' };
    const result = checkFreezeDrift(env, store);
    expect(result.clean).toBe(true);
    expect(result.driftedCount).toBe(0);
    expect(result.missingCount).toBe(0);
  });

  it('detects drifted values', () => {
    const env: ParsedEnv = { API_KEY: 'newvalue', DB_HOST: 'localhost' };
    const result = checkFreezeDrift(env, store);
    expect(result.clean).toBe(false);
    expect(result.driftedCount).toBe(1);
    const drifted = result.entries.find(e => e.key === 'API_KEY');
    expect(drifted?.drifted).toBe(true);
    expect(drifted?.currentValue).toBe('newvalue');
  });

  it('detects missing keys', () => {
    const env: ParsedEnv = { DB_HOST: 'localhost' };
    const result = checkFreezeDrift(env, store);
    expect(result.clean).toBe(false);
    expect(result.missingCount).toBe(1);
    const missing = result.entries.find(e => e.key === 'API_KEY');
    expect(missing?.currentValue).toBeUndefined();
  });

  it('handles empty frozen store', () => {
    const emptyStore = { keys: {}, frozenAt: new Date().toISOString() };
    const env: ParsedEnv = { API_KEY: 'value' };
    const result = checkFreezeDrift(env, emptyStore);
    expect(result.clean).toBe(true);
    expect(result.entries).toHaveLength(0);
  });
});
