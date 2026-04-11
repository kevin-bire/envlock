import { maskEnv, maskValue, shouldMaskKey } from '../envMask';

describe('shouldMaskKey', () => {
  it('masks keys matching default sensitive patterns', () => {
    expect(shouldMaskKey('DB_PASSWORD', {})).toBe(true);
    expect(shouldMaskKey('API_SECRET', {})).toBe(true);
    expect(shouldMaskKey('AUTH_TOKEN', {})).toBe(true);
    expect(shouldMaskKey('API_KEY', {})).toBe(true);
  });

  it('does not mask non-sensitive keys', () => {
    expect(shouldMaskKey('APP_NAME', {})).toBe(false);
    expect(shouldMaskKey('PORT', {})).toBe(false);
    expect(shouldMaskKey('NODE_ENV', {})).toBe(false);
  });

  it('masks keys in explicit keys list', () => {
    expect(shouldMaskKey('MY_CUSTOM_KEY', { keys: ['MY_CUSTOM_KEY'] })).toBe(true);
  });

  it('masks keys matching custom patterns', () => {
    expect(shouldMaskKey('STRIPE_PK', { patterns: [/stripe/i] })).toBe(true);
    expect(shouldMaskKey('DB_HOST', { patterns: [/stripe/i] })).toBe(false);
  });
});

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('supersecret')).toBe('********');
  });

  it('masks empty string as empty', () => {
    expect(maskValue('')).toBe('');
  });

  it('reveals trailing characters when revealChars > 0', () => {
    const result = maskValue('abcdef', '*', 2);
    expect(result.endsWith('ef')).toBe(true);
    expect(result).toContain('*');
  });

  it('uses custom mask character', () => {
    expect(maskValue('hello', '#')).toBe('########');
  });
});

describe('maskEnv', () => {
  const env = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'secret123',
    API_KEY: 'key-abc',
    PORT: '3000',
  };

  it('masks sensitive keys', () => {
    const { masked, maskedKeys } = maskEnv(env);
    expect(masked['DB_PASSWORD']).not.toBe('secret123');
    expect(masked['API_KEY']).not.toBe('key-abc');
    expect(maskedKeys).toContain('DB_PASSWORD');
    expect(maskedKeys).toContain('API_KEY');
  });

  it('preserves non-sensitive keys', () => {
    const { masked } = maskEnv(env);
    expect(masked['APP_NAME']).toBe('myapp');
    expect(masked['PORT']).toBe('3000');
  });

  it('respects explicit keys option', () => {
    const { maskedKeys } = maskEnv(env, { keys: ['PORT'] });
    expect(maskedKeys).toContain('PORT');
  });

  it('returns empty maskedKeys when no sensitive keys found', () => {
    const { maskedKeys } = maskEnv({ APP_NAME: 'test', PORT: '8080' });
    expect(maskedKeys).toHaveLength(0);
  });
});
