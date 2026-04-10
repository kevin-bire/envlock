import { redactEnv, shouldRedact, RedactOptions } from '../envRedact';

describe('shouldRedact', () => {
  it('returns true for keys matching default sensitive patterns', () => {
    expect(shouldRedact('DB_PASSWORD')).toBe(true);
    expect(shouldRedact('API_SECRET')).toBe(true);
    expect(shouldRedact('AUTH_TOKEN')).toBe(true);
    expect(shouldRedact('STRIPE_API_KEY')).toBe(true);
    expect(shouldRedact('PRIVATE_KEY')).toBe(true);
  });

  it('returns false for non-sensitive keys', () => {
    expect(shouldRedact('APP_NAME')).toBe(false);
    expect(shouldRedact('NODE_ENV')).toBe(false);
    expect(shouldRedact('PORT')).toBe(false);
  });

  it('returns true for explicitly listed keys', () => {
    const options: RedactOptions = { keys: ['MY_CUSTOM_KEY'] };
    expect(shouldRedact('MY_CUSTOM_KEY', options)).toBe(true);
    expect(shouldRedact('APP_NAME', options)).toBe(false);
  });

  it('returns true for keys matching custom patterns', () => {
    const options: RedactOptions = { patterns: [/internal/i] };
    expect(shouldRedact('INTERNAL_URL', options)).toBe(true);
    expect(shouldRedact('APP_NAME', options)).toBe(false);
  });
});

describe('redactEnv', () => {
  const env = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'supersecret',
    API_KEY: 'abc123',
    PORT: '3000',
    AUTH_TOKEN: 'tok_xyz',
  };

  it('redacts sensitive keys with default placeholder', () => {
    const result = redactEnv(env);
    expect(result.redacted['DB_PASSWORD']).toBe('***REDACTED***');
    expect(result.redacted['API_KEY']).toBe('***REDACTED***');
    expect(result.redacted['AUTH_TOKEN']).toBe('***REDACTED***');
  });

  it('preserves non-sensitive keys', () => {
    const result = redactEnv(env);
    expect(result.redacted['APP_NAME']).toBe('myapp');
    expect(result.redacted['PORT']).toBe('3000');
  });

  it('tracks which keys were redacted', () => {
    const result = redactEnv(env);
    expect(result.redactedKeys).toContain('DB_PASSWORD');
    expect(result.redactedKeys).toContain('API_KEY');
    expect(result.redactedKeys).toContain('AUTH_TOKEN');
    expect(result.redactedKeys).not.toContain('APP_NAME');
  });

  it('uses a custom placeholder', () => {
    const result = redactEnv(env, { placeholder: '[HIDDEN]' });
    expect(result.redacted['DB_PASSWORD']).toBe('[HIDDEN]');
  });

  it('preserves the original env map unchanged', () => {
    const result = redactEnv(env);
    expect(result.original['DB_PASSWORD']).toBe('supersecret');
  });

  it('redacts explicitly listed keys', () => {
    const result = redactEnv(env, { keys: ['APP_NAME'], patterns: [] });
    expect(result.redacted['APP_NAME']).toBe('***REDACTED***');
    expect(result.redacted['DB_PASSWORD']).toBe('supersecret');
  });
});
