import { formatIssue, formatCheckResult, formatCheckSummary } from '../checkFormatter';
import { CheckIssue, CheckResult } from '../envCheck';

const makeResult = (overrides: Partial<CheckResult> = {}): CheckResult => ({
  issues: [],
  passed: 5,
  failed: 0,
  warned: 0,
  ...overrides,
});

describe('formatIssue', () => {
  it('formats an error issue', () => {
    const issue: CheckIssue = { key: 'API_SECRET', rule: 'sensitive-empty', message: 'Empty secret', severity: 'error' };
    const output = formatIssue(issue);
    expect(output).toContain('ERROR');
    expect(output).toContain('sensitive-empty');
    expect(output).toContain('Empty secret');
    expect(output).toContain('✖');
  });

  it('formats a warn issue', () => {
    const issue: CheckIssue = { key: 'TOKEN', rule: 'placeholder-value', message: 'Placeholder found', severity: 'warn' };
    const output = formatIssue(issue);
    expect(output).toContain('WARN');
    expect(output).toContain('⚠');
  });

  it('formats an info issue', () => {
    const issue: CheckIssue = { key: 'PORT', rule: 'some-rule', message: 'Just info', severity: 'info' };
    const output = formatIssue(issue);
    expect(output).toContain('INFO');
    expect(output).toContain('ℹ');
  });
});

describe('formatCheckResult', () => {
  it('returns success message when no issues', () => {
    const result = makeResult();
    expect(formatCheckResult(result)).toContain('All checks passed');
  });

  it('includes error section when errors present', () => {
    const issue: CheckIssue = { key: 'X', rule: 'r', message: 'msg', severity: 'error' };
    const result = makeResult({ issues: [issue], failed: 1 });
    const output = formatCheckResult(result);
    expect(output).toContain('Errors:');
    expect(output).toContain('msg');
  });

  it('includes warnings section when warnings present', () => {
    const issue: CheckIssue = { key: 'Y', rule: 'r2', message: 'warn msg', severity: 'warn' };
    const result = makeResult({ issues: [issue], warned: 1 });
    const output = formatCheckResult(result);
    expect(output).toContain('Warnings:');
    expect(output).toContain('warn msg');
  });

  it('does not include empty sections', () => {
    const issue: CheckIssue = { key: 'Z', rule: 'r3', message: 'only error', severity: 'error' };
    const result = makeResult({ issues: [issue], failed: 1 });
    const output = formatCheckResult(result);
    expect(output).not.toContain('Warnings:');
  });
});

describe('formatCheckSummary', () => {
  it('formats summary with all counts', () => {
    const result = makeResult({ passed: 3, failed: 2, warned: 1 });
    const output = formatCheckSummary(result);
    expect(output).toContain('Total keys checked: 6');
    expect(output).toContain('Passed: 3');
    expect(output).toContain('Errors: 2');
    expect(output).toContain('Warnings: 1');
  });
});
