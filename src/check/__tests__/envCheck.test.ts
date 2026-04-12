import { checkEnv, CheckResult } from '../envCheck';

describe('checkEnv', () => {
  it('returns no issues for a clean env', () => {
    const env = { DATABASE_URL: 'postgres://localhost/db', PORT: '3000' };
    const result = checkEnv(env);
    expect(result.issues).toHaveLength(0);
    expect(result.failed).toBe(0);
    expect(result.warned).toBe(0);
  });

  it('flags sensitive key with empty value as error', () => {
    const env = { API_SECRET: '' };
    const result = checkEnv(env);
    const issue = result.issues.find(i => i.rule === 'sensitive-empty');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
    expect(issue?.key).toBe('API_SECRET');
  });

  it('flags placeholder values as warn by default', () => {
    const env = { API_KEY: 'CHANGE_ME' };
    const result = checkEnv(env);
    const issue = result.issues.find(i => i.rule === 'placeholder-value');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('flags placeholder values as error in strict mode', () => {
    const env = { API_KEY: 'CHANGE_ME' };
    const result = checkEnv(env, true);
    const issue = result.issues.find(i => i.rule === 'placeholder-value');
    expect(issue?.severity).toBe('error');
  });

  it('flags required-like key with empty value', () => {
    const env = { MANDATORY_TOKEN: '' };
    const result = checkEnv(env);
    const issue = result.issues.find(i => i.rule === 'required-empty');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
  });

  it('flags keys not following UPPER_SNAKE_CASE as warn', () => {
    const env = { myApiKey: 'value123' };
    const result = checkEnv(env);
    const issue = result.issues.find(i => i.rule === 'key-naming');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('flags key-naming as error in strict mode', () => {
    const env = { myApiKey: 'value' };
    const result = checkEnv(env, true);
    const issue = result.issues.find(i => i.rule === 'key-naming');
    expect(issue?.severity).toBe('error');
  });

  it('counts passed keys correctly', () => {
    const env = { GOOD_KEY: 'value', BAD_KEY: '' };
    // BAD_KEY has sensitive-like name? No. But empty. Only required-empty fires if name matches.
    // GOOD_KEY passes, BAD_KEY has no rule hit (not sensitive, not placeholder, not required)
    const result = checkEnv(env);
    expect(result.issues).toHaveLength(0);
    expect(result.passed).toBe(2);
  });

  it('handles multiple issues on same key', () => {
    const env = { api_secret: 'CHANGE_ME' };
    const result = checkEnv(env);
    // key-naming (lowercase), placeholder-value
    const rules = result.issues.map(i => i.rule);
    expect(rules).toContain('key-naming');
    expect(rules).toContain('placeholder-value');
  });
});
