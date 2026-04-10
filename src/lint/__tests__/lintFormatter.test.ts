import { formatIssue, formatLintResult } from '../lintFormatter';
import { LintIssue, LintResult } from '../envLinter';

describe('formatIssue', () => {
  it('formats an error issue with key and message', () => {
    const issue: LintIssue = { key: 'DATABASE_URL', severity: 'error', message: 'Value is empty' };
    const result = formatIssue(issue);
    expect(result).toContain('DATABASE_URL');
    expect(result).toContain('Value is empty');
    expect(result).toContain('error');
  });

  it('formats a warning issue', () => {
    const issue: LintIssue = { key: 'API_KEY', severity: 'warning', message: 'Key uses lowercase letters' };
    const result = formatIssue(issue);
    expect(result).toContain('API_KEY');
    expect(result).toContain('warning');
    expect(result).toContain('Key uses lowercase letters');
  });

  it('formats an info issue', () => {
    const issue: LintIssue = { key: 'DEBUG', severity: 'info', message: 'Consider using a boolean value' };
    const result = formatIssue(issue);
    expect(result).toContain('DEBUG');
    expect(result).toContain('info');
  });
});

describe('formatLintResult', () => {
  it('returns a passed message when no issues', () => {
    const result: LintResult = { issues: [], passed: true };
    const output = formatLintResult(result);
    expect(output).toContain('passed');
    expect(output).not.toContain('error');
  });

  it('formats all issues and shows summary', () => {
    const result: LintResult = {
      issues: [
        { key: 'FOO', severity: 'error', message: 'Missing value' },
        { key: 'BAR', severity: 'warning', message: 'Suspicious pattern' },
      ],
      passed: false,
    };
    const output = formatLintResult(result);
    expect(output).toContain('FOO');
    expect(output).toContain('BAR');
    expect(output).toContain('2');
  });

  it('includes error and warning counts in summary', () => {
    const result: LintResult = {
      issues: [
        { key: 'A', severity: 'error', message: 'err1' },
        { key: 'B', severity: 'error', message: 'err2' },
        { key: 'C', severity: 'warning', message: 'warn1' },
      ],
      passed: false,
    };
    const output = formatLintResult(result);
    expect(output).toContain('2');
    expect(output).toContain('1');
  });
});
