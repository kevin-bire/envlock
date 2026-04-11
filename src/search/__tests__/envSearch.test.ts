import { searchEnv, SearchResult } from '../envSearch';
import { ParsedEnv } from '../../parser/envParser';

const sampleEnv: ParsedEnv = {
  DATABASE_URL: 'postgres://localhost:5432/mydb',
  DB_HOST: 'localhost',
  API_KEY: 'secret123',
  APP_NAME: 'envlock',
  DEBUG: 'true',
};

describe('searchEnv', () => {
  it('finds matches in keys by default', () => {
    const result = searchEnv(sampleEnv, 'DB');
    const keys = result.matches.map((m) => m.key);
    expect(keys).toContain('DATABASE_URL');
    expect(keys).toContain('DB_HOST');
  });

  it('finds matches in values', () => {
    const result = searchEnv(sampleEnv, 'localhost', { searchValues: true, searchKeys: false });
    const keys = result.matches.map((m) => m.key);
    expect(keys).toContain('DATABASE_URL');
    expect(keys).toContain('DB_HOST');
  });

  it('reports matchedOn correctly for key-only match', () => {
    const result = searchEnv(sampleEnv, 'API_KEY', { exact: true });
    expect(result.matches[0].matchedOn).toBe('key');
  });

  it('reports matchedOn = both when query matches key and value', () => {
    const env: ParsedEnv = { LOCALHOST: 'localhost' };
    const result = searchEnv(env, 'localhost');
    expect(result.matches[0].matchedOn).toBe('both');
  });

  it('is case-insensitive by default', () => {
    const result = searchEnv(sampleEnv, 'database');
    const keys = result.matches.map((m) => m.key);
    expect(keys).toContain('DATABASE_URL');
  });

  it('respects caseSensitive option', () => {
    const result = searchEnv(sampleEnv, 'database', { caseSensitive: true });
    expect(result.matches).toHaveLength(0);
  });

  it('returns correct totalScanned count', () => {
    const result = searchEnv(sampleEnv, 'xyz');
    expect(result.totalScanned).toBe(Object.keys(sampleEnv).length);
  });

  it('returns empty matches when nothing found', () => {
    const result = searchEnv(sampleEnv, 'zzznomatch');
    expect(result.matches).toHaveLength(0);
  });

  it('supports exact matching', () => {
    const result = searchEnv(sampleEnv, 'true', { exact: true, searchValues: true, searchKeys: false });
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].key).toBe('DEBUG');
  });
});
