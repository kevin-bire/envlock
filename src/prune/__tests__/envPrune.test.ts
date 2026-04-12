import { pruneEnv, pruneEmpty, pruneByAllowlist } from '../envPrune';
import { ParsedEnv } from '../../parser/envParser';

const sampleEnv: ParsedEnv = {
  API_KEY: 'abc123',
  DB_HOST: 'localhost',
  DB_PASS: '',
  DEBUG: 'true',
  SECRET: '',
  PORT: '3000',
};

describe('pruneEmpty', () => {
  it('returns keys with empty string values', () => {
    const result = pruneEmpty(sampleEnv);
    expect(result).toContain('DB_PASS');
    expect(result).toContain('SECRET');
    expect(result).not.toContain('API_KEY');
  });

  it('returns empty array when no empty values', () => {
    const env: ParsedEnv = { KEY: 'value', OTHER: 'thing' };
    expect(pruneEmpty(env)).toEqual([]);
  });
});

describe('pruneByAllowlist', () => {
  it('returns keys not in the allowlist', () => {
    const result = pruneByAllowlist(sampleEnv, ['API_KEY', 'DB_HOST']);
    expect(result).toContain('DEBUG');
    expect(result).toContain('DB_PASS');
    expect(result).not.toContain('API_KEY');
    expect(result).not.toContain('DB_HOST');
  });

  it('returns all keys when allowlist is empty', () => {
    const result = pruneByAllowlist(sampleEnv, []);
    expect(result).toHaveLength(Object.keys(sampleEnv).length);
  });
});

describe('pruneEnv', () => {
  it('removes keys not in keepKeys', () => {
    const result = pruneEnv(sampleEnv, { keepKeys: ['API_KEY', 'PORT'] });
    expect(result.keptKeys).toEqual(['API_KEY', 'PORT']);
    expect(result.removedKeys).toContain('DB_HOST');
    expect(result.removedKeys).toContain('DEBUG');
  });

  it('removes empty keys when removeEmpty is true', () => {
    const result = pruneEnv(sampleEnv, { removeEmpty: true });
    expect(result.removedEmpty).toContain('DB_PASS');
    expect(result.removedEmpty).toContain('SECRET');
    expect(result.keptKeys).not.toContain('DB_PASS');
  });

  it('combines keepKeys and removeEmpty', () => {
    const result = pruneEnv(sampleEnv, {
      keepKeys: ['API_KEY', 'PORT', 'DB_PASS'],
      removeEmpty: true,
    });
    expect(result.keptKeys).toContain('API_KEY');
    expect(result.keptKeys).toContain('PORT');
    expect(result.keptKeys).not.toContain('DB_PASS');
    expect(result.removedEmpty).toContain('DB_PASS');
  });

  it('returns original env unchanged', () => {
    const result = pruneEnv(sampleEnv, {});
    expect(result.original).toEqual(sampleEnv);
  });

  it('returns all keys when no options given', () => {
    const result = pruneEnv(sampleEnv);
    expect(result.keptKeys).toHaveLength(Object.keys(sampleEnv).length);
    expect(result.removedKeys).toHaveLength(0);
    expect(result.removedEmpty).toHaveLength(0);
  });
});
