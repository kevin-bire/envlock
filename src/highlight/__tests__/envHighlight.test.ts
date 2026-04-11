import { categorize, highlightEnv, HighlightResult } from '../envHighlight';

describe('categorize', () => {
  it('detects secret keys', () => {
    expect(categorize('API_SECRET', 'abc123')).toBe('secret');
    expect(categorize('DB_PASSWORD', 'pass')).toBe('secret');
    expect(categorize('AUTH_TOKEN', 'tok')).toBe('secret');
    expect(categorize('PRIVATE_KEY', 'key')).toBe('secret');
  });

  it('detects URL values', () => {
    expect(categorize('DATABASE_URL', 'https://db.example.com')).toBe('url');
    expect(categorize('API_URL', 'http://localhost:3000')).toBe('url');
  });

  it('detects boolean flags', () => {
    expect(categorize('FEATURE_FLAG', 'true')).toBe('flag');
    expect(categorize('ENABLED', 'false')).toBe('flag');
    expect(categorize('DEBUG', 'yes')).toBe('flag');
    expect(categorize('ACTIVE', '1')).toBe('flag');
  });

  it('detects numeric values', () => {
    expect(categorize('PORT', '3000')).toBe('number');
    expect(categorize('TIMEOUT', '30.5')).toBe('number');
    expect(categorize('RETRIES', '-1')).toBe('number');
  });

  it('detects empty values', () => {
    expect(categorize('OPTIONAL_KEY', '')).toBe('empty');
  });

  it('falls back to default', () => {
    expect(categorize('APP_NAME', 'myapp')).toBe('default');
    expect(categorize('LOG_LEVEL', 'info')).toBe('default');
  });
});

describe('highlightEnv', () => {
  const env = {
    API_SECRET: 'super-secret',
    DATABASE_URL: 'https://db.example.com',
    DEBUG: 'true',
    PORT: '8080',
    APP_NAME: 'envlock',
    OPTIONAL: '',
  };

  it('categorizes all entries', () => {
    const result: HighlightResult = highlightEnv(env);
    expect(result.entries).toHaveLength(6);
    const categories = result.entries.map((e) => e.category);
    expect(categories).toContain('secret');
    expect(categories).toContain('url');
    expect(categories).toContain('flag');
    expect(categories).toContain('number');
    expect(categories).toContain('default');
    expect(categories).toContain('empty');
  });

  it('masks secret values by default', () => {
    const result = highlightEnv(env);
    const secretEntry = result.entries.find((e) => e.key === 'API_SECRET');
    expect(secretEntry?.value).toBe('***');
  });

  it('shows secret values when maskSecrets is false', () => {
    const result = highlightEnv(env, { maskSecrets: false });
    const secretEntry = result.entries.find((e) => e.key === 'API_SECRET');
    expect(secretEntry?.value).toBe('super-secret');
  });

  it('returns accurate category counts', () => {
    const result = highlightEnv(env);
    expect(result.categoryCounts.secret).toBe(1);
    expect(result.categoryCounts.url).toBe(1);
    expect(result.categoryCounts.flag).toBe(1);
    expect(result.categoryCounts.number).toBe(1);
    expect(result.categoryCounts.default).toBe(1);
    expect(result.categoryCounts.empty).toBe(1);
  });

  it('handles empty env object', () => {
    const result = highlightEnv({});
    expect(result.entries).toHaveLength(0);
    expect(result.categoryCounts.secret).toBe(0);
  });
});
