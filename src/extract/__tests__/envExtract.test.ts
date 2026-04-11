import { extractEnv, extractByPattern } from '../envExtract';
import { formatExtractResult, formatExtractPreview, formatExtractSummary } from '../extractFormatter';

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret',
  APP_NAME: 'envlock',
};

describe('extractEnv', () => {
  it('extracts specified keys', () => {
    const result = extractEnv(sampleEnv, { keys: ['DB_HOST', 'API_KEY'] });
    expect(result.extracted).toEqual({ DB_HOST: 'localhost', API_KEY: 'secret' });
    expect(result.found).toEqual(['DB_HOST', 'API_KEY']);
    expect(result.missing).toEqual([]);
  });

  it('tracks missing keys in non-strict mode', () => {
    const result = extractEnv(sampleEnv, { keys: ['DB_HOST', 'MISSING_KEY'] });
    expect(result.found).toContain('DB_HOST');
    expect(result.missing).toContain('MISSING_KEY');
    expect(result.extracted).not.toHaveProperty('MISSING_KEY');
  });

  it('throws in strict mode when key is missing', () => {
    expect(() =>
      extractEnv(sampleEnv, { keys: ['NONEXISTENT'], strict: true })
    ).toThrow('Key "NONEXISTENT" not found in env (strict mode)');
  });

  it('returns empty extracted when keys array is empty', () => {
    const result = extractEnv(sampleEnv, { keys: [] });
    expect(result.extracted).toEqual({});
    expect(result.found).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });
});

describe('extractByPattern', () => {
  it('extracts keys matching pattern', () => {
    const result = extractByPattern(sampleEnv, /^DB_/);
    expect(result.extracted).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.found).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('returns empty when no keys match', () => {
    const result = extractByPattern(sampleEnv, /^UNKNOWN_/);
    expect(result.extracted).toEqual({});
    expect(result.found).toHaveLength(0);
  });
});

describe('extractFormatter', () => {
  it('formatExtractResult includes found and missing keys', () => {
    const result = extractEnv(sampleEnv, { keys: ['DB_HOST', 'MISSING'] });
    const output = formatExtractResult(result);
    expect(output).toContain('✔ DB_HOST');
    expect(output).toContain('✘ MISSING');
  });

  it('formatExtractSummary shows correct counts', () => {
    const result = extractEnv(sampleEnv, { keys: ['DB_HOST', 'MISSING'] });
    const summary = formatExtractSummary(result);
    expect(summary).toContain('1 key(s)');
    expect(summary).toContain('Missing');
  });

  it('formatExtractPreview masks values when requested', () => {
    const result = extractEnv(sampleEnv, { keys: ['API_KEY'] });
    const preview = formatExtractPreview(result, true);
    expect(preview).toContain('API_KEY=****');
    expect(preview).not.toContain('secret');
  });

  it('formatExtractPreview shows real values when not masked', () => {
    const result = extractEnv(sampleEnv, { keys: ['APP_NAME'] });
    const preview = formatExtractPreview(result, false);
    expect(preview).toContain('APP_NAME=envlock');
  });
});
