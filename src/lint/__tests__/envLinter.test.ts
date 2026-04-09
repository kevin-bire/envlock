import { lintEnv } from '../envLinter';
import { formatLintResult } from '../lintFormatter';

describe('lintEnv', () => {
  it('returns no issues for a clean env', () => {
    const result = lintEnv({ NODE_ENV: 'production', PORT: '3000' });
    expect(result.issues).toHaveLength(0);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
  });

  it('reports error for empty sensitive key', () => {
    const result = lintEnv({ API_KEY: '' });
    const issue = result.issues.find((i) => i.key === 'API_KEY' && i.severity === 'error');
    expect(issue).toBeDefined();
    expect(result.errorCount).toBe(1);
  });

  it('reports warning for placeholder value', () => {
    const result = lintEnv({ DB_HOST: 'changeme' });
    const issue = result.issues.find((i) => i.key === 'DB_HOST' && i.severity === 'warning');
    expect(issue).toBeDefined();
  });

  it('reports warning for plain-text sensitive value', () => {
    const result = lintEnv({ SECRET_TOKEN: 'mysecret123' });
    const issue = result.issues.find(
      (i) => i.key === 'SECRET_TOKEN' && i.severity === 'warning'
    );
    expect(issue).toBeDefined();
  });

  it('does not warn if sensitive value is encrypted (enc: prefix)', () => {
    const result = lintEnv({ SECRET_TOKEN: 'enc:abc123' });
    const plainTextWarning = result.issues.find(
      (i) => i.key === 'SECRET_TOKEN' && i.message.includes('plain-text')
    );
    expect(plainTextWarning).toBeUndefined();
  });

  it('reports error for key with whitespace', () => {
    const result = lintEnv({ 'MY KEY': 'value' });
    const issue = result.issues.find((i) => i.key === 'MY KEY' && i.severity === 'error');
    expect(issue).toBeDefined();
  });

  it('reports info for lowercase key', () => {
    const result = lintEnv({ myKey: 'value' });
    const issue = result.issues.find((i) => i.key === 'myKey' && i.severity === 'info');
    expect(issue).toBeDefined();
  });
});

describe('formatLintResult', () => {
  it('shows no issues message when clean', () => {
    const result = lintEnv({ PORT: '8080' });
    const output = formatLintResult(result, '.env');
    expect(output).toContain('No issues found');
    expect(output).toContain('.env');
  });

  it('includes issue details in output', () => {
    const result = lintEnv({ api_secret: 'plaintext' });
    const output = formatLintResult(result);
    expect(output).toContain('api_secret');
    expect(output).toContain('WARN');
  });

  it('shows summary counts', () => {
    const result = lintEnv({ SECRET: '' });
    const output = formatLintResult(result);
    expect(output).toMatch(/\d+ error\(s\)/);
  });
});
