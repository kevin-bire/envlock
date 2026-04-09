import { validateEnv, EnvSchema } from '../schemaValidator';

const schema: EnvSchema = {
  DATABASE_URL: { type: 'url', required: true },
  PORT: { type: 'number', required: true },
  DEBUG: { type: 'boolean', required: false },
  ADMIN_EMAIL: { type: 'email', required: true },
  APP_NAME: { type: 'string', required: false, pattern: '^[a-z-]+$' },
};

describe('validateEnv', () => {
  it('returns valid when all required fields are correct', () => {
    const env = {
      DATABASE_URL: 'https://db.example.com',
      PORT: '3000',
      ADMIN_EMAIL: 'admin@example.com',
    };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for missing required field', () => {
    const env = { PORT: '3000', ADMIN_EMAIL: 'admin@example.com' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.key === 'DATABASE_URL')).toBe(true);
  });

  it('reports error for invalid number type', () => {
    const env = { DATABASE_URL: 'https://db.example.com', PORT: 'abc', ADMIN_EMAIL: 'a@b.com' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.key === 'PORT')).toBe(true);
  });

  it('reports error for invalid email', () => {
    const env = { DATABASE_URL: 'https://db.example.com', PORT: '3000', ADMIN_EMAIL: 'not-an-email' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.key === 'ADMIN_EMAIL')).toBe(true);
  });

  it('reports error for pattern mismatch', () => {
    const env = {
      DATABASE_URL: 'https://db.example.com',
      PORT: '3000',
      ADMIN_EMAIL: 'a@b.com',
      APP_NAME: 'My App 123',
    };
    const result = validateEnv(env, schema);
    expect(result.errors.some((e) => e.key === 'APP_NAME')).toBe(true);
  });

  it('warns for optional missing fields and unknown fields', () => {
    const env = {
      DATABASE_URL: 'https://db.example.com',
      PORT: '3000',
      ADMIN_EMAIL: 'a@b.com',
      UNKNOWN_KEY: 'value',
    };
    const result = validateEnv(env, schema);
    expect(result.warnings.some((w) => w.includes('DEBUG'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('UNKNOWN_KEY'))).toBe(true);
  });

  it('treats empty string as missing for required fields', () => {
    const env = { DATABASE_URL: '', PORT: '3000', ADMIN_EMAIL: 'a@b.com' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.key === 'DATABASE_URL')).toBe(true);
  });
});
