import { validateEnvFile, summarizeValidation } from '../envValidate';
import { ParsedEnv } from '../../parser/envParser';
import { Schema } from '../../schema/schemaLoader';

const schema: Schema = {
  DATABASE_URL: { type: 'string', required: true },
  PORT: { type: 'number', required: false },
  DEBUG: { type: 'boolean', required: false },
};

describe('validateEnvFile', () => {
  it('returns valid when all required keys are present', () => {
    const env: ParsedEnv = { DATABASE_URL: 'postgres://localhost/db' };
    const result = validateEnvFile(env, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for missing required key', () => {
    const env: ParsedEnv = {};
    const result = validateEnvFile(env, schema);
    expect(result.valid).toBe(false);
    expect(result.missingKeys).toContain('DATABASE_URL');
    expect(result.errors.some(e => e.includes('DATABASE_URL'))).toBe(true);
  });

  it('reports warning for missing optional key', () => {
    const env: ParsedEnv = { DATABASE_URL: 'postgres://localhost/db' };
    const result = validateEnvFile(env, schema);
    expect(result.warnings.some(w => w.includes('PORT') || w.includes('DEBUG'))).toBe(true);
  });

  it('reports extra keys as warnings when allowExtra is true', () => {
    const env: ParsedEnv = { DATABASE_URL: 'postgres://localhost/db', UNKNOWN_KEY: 'value' };
    const result = validateEnvFile(env, schema, { allowExtra: true });
    expect(result.extraKeys).toContain('UNKNOWN_KEY');
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.includes('UNKNOWN_KEY'))).toBe(true);
  });

  it('reports extra keys as errors in strict mode', () => {
    const env: ParsedEnv = { DATABASE_URL: 'postgres://localhost/db', UNKNOWN_KEY: 'value' };
    const result = validateEnvFile(env, schema, { strict: true });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('UNKNOWN_KEY'))).toBe(true);
  });

  it('returns correct counts for mixed env', () => {
    const env: ParsedEnv = { DATABASE_URL: 'postgres://localhost/db', EXTRA: 'x' };
    const result = validateEnvFile(env, schema, { allowExtra: true });
    expect(result.missingKeys).not.toContain('DATABASE_URL');
    expect(result.extraKeys).toContain('EXTRA');
  });
});

describe('summarizeValidation', () => {
  it('returns a summary string with counts', () => {
    const result = validateEnvFile({}, schema);
    const summary = summarizeValidation(result);
    expect(summary).toContain('FAILED');
    expect(summary).toContain('Errors');
    expect(summary).toContain('Missing');
  });

  it('returns PASSED for valid result', () => {
    const env: ParsedEnv = { DATABASE_URL: 'postgres://localhost/db' };
    const result = validateEnvFile(env, schema);
    const summary = summarizeValidation(result);
    expect(summary).toContain('PASSED');
  });
});
