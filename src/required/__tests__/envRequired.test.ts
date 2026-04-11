import { checkRequired, getMissingRequired } from '../envRequired';
import { ParsedEnv } from '../../parser/envParser';

const sampleEnv: ParsedEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'abc123',
  EMPTY_KEY: '',
};

describe('checkRequired', () => {
  it('marks present keys correctly', () => {
    const result = checkRequired(sampleEnv, ['DB_HOST', 'DB_PORT']);
    expect(result.present).toEqual(['DB_HOST', 'DB_PORT']);
    expect(result.missing).toEqual([]);
    expect(result.allSatisfied).toBe(true);
  });

  it('marks missing keys correctly', () => {
    const result = checkRequired(sampleEnv, ['DB_HOST', 'SECRET']);
    expect(result.missing).toContain('SECRET');
    expect(result.allSatisfied).toBe(false);
  });

  it('treats empty string values as missing', () => {
    const result = checkRequired(sampleEnv, ['EMPTY_KEY']);
    expect(result.missing).toContain('EMPTY_KEY');
    expect(result.allSatisfied).toBe(false);
  });

  it('returns all checks with correct shape', () => {
    const result = checkRequired(sampleEnv, ['DB_HOST', 'MISSING']);
    expect(result.checks).toHaveLength(2);
    expect(result.checks[0]).toMatchObject({ key: 'DB_HOST', present: true });
    expect(result.checks[1]).toMatchObject({ key: 'MISSING', present: false });
  });

  it('returns allSatisfied true when no keys required', () => {
    const result = checkRequired(sampleEnv, []);
    expect(result.allSatisfied).toBe(true);
    expect(result.checks).toHaveLength(0);
  });

  it('handles duplicate required keys without double-counting', () => {
    const result = checkRequired(sampleEnv, ['DB_HOST', 'DB_HOST']);
    expect(result.present).toEqual(['DB_HOST', 'DB_HOST']);
    expect(result.checks).toHaveLength(2);
    expect(result.allSatisfied).toBe(true);
  });
});

describe('getMissingRequired', () => {
  it('returns keys not present in env', () => {
    const missing = getMissingRequired(sampleEnv, ['DB_HOST', 'UNKNOWN']);
    expect(missing).toEqual(['UNKNOWN']);
  });

  it('returns empty array when all keys present', () => {
    const missing = getMissingRequired(sampleEnv, ['DB_HOST', 'API_KEY']);
    expect(missing).toEqual([]);
  });

  it('includes keys with empty values', () => {
    const missing = getMissingRequired(sampleEnv, ['EMPTY_KEY']);
    expect(missing).toContain('EMPTY_KEY');
  });

  it('returns empty array when required list is empty', () => {
    const missing = getMissingRequired(sampleEnv, []);
    expect(missing).toEqual([]);
  });
});
