import { filterEnv, filterByKeys, filterByPattern } from '../envFilter';
import { ParsedEnv } from '../../parser/envParser';

const sampleEnv: ParsedEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret',
  API_URL: 'https://api.example.com',
  DEBUG: 'true',
};

describe('filterByKeys', () => {
  it('includes only specified keys', () => {
    const result = filterByKeys(sampleEnv, ['DB_HOST', 'DEBUG'], 'include');
    expect(Object.keys(result.filtered)).toEqual(['DB_HOST', 'DEBUG']);
    expect(result.matched).toContain('DB_HOST');
    expect(result.matched).toContain('DEBUG');
  });

  it('excludes specified keys', () => {
    const result = filterByKeys(sampleEnv, ['API_KEY'], 'exclude');
    expect(result.filtered).not.toHaveProperty('API_KEY');
    expect(result.matched).toEqual(['API_KEY']);
  });

  it('returns empty filtered when all keys excluded', () => {
    const result = filterByKeys(sampleEnv, Object.keys(sampleEnv), 'exclude');
    expect(Object.keys(result.filtered)).toHaveLength(0);
  });
});

describe('filterByPattern', () => {
  it('includes keys matching pattern', () => {
    const result = filterByPattern(sampleEnv, '^DB_', 'include');
    expect(Object.keys(result.filtered)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('excludes keys matching pattern', () => {
    const result = filterByPattern(sampleEnv, '^API_', 'exclude');
    expect(result.filtered).not.toHaveProperty('API_KEY');
    expect(result.filtered).not.toHaveProperty('API_URL');
    expect(result.filtered).toHaveProperty('DB_HOST');
  });

  it('handles no matches gracefully', () => {
    const result = filterByPattern(sampleEnv, '^NONEXISTENT_', 'include');
    expect(Object.keys(result.filtered)).toHaveLength(0);
    expect(result.matched).toHaveLength(0);
  });
});

describe('filterEnv', () => {
  it('delegates to filterByPattern when pattern provided', () => {
    const result = filterEnv(sampleEnv, { pattern: '^DB_', mode: 'include' });
    expect(Object.keys(result.filtered)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('delegates to filterByKeys when keys provided', () => {
    const result = filterEnv(sampleEnv, { keys: ['DEBUG'], mode: 'include' });
    expect(result.filtered).toHaveProperty('DEBUG');
  });

  it('returns all keys when no filter options given', () => {
    const result = filterEnv(sampleEnv, { mode: 'include' });
    expect(Object.keys(result.filtered)).toHaveLength(Object.keys(sampleEnv).length);
  });
});
