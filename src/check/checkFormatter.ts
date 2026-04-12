import { CheckIssue, CheckResult } from './envCheck';

const SEVERITY_ICONS: Record<string, string> = {
  error: '✖',
  warn:  '⚠',
  info:  'ℹ',
};

const SEVERITY_LABELS: Record<string, string> = {
  error: 'ERROR',
  warn:  'WARN ',
  info:  'INFO ',
};

export function formatIssue(issue: CheckIssue): string {
  const icon = SEVERITY_ICONS[issue.severity] ?? '•';
  const label = SEVERITY_LABELS[issue.severity] ?? issue.severity.toUpperCase();
  return `  ${icon} [${label}] (${issue.rule}) ${issue.message}`;
}

export function formatCheckResult(result: CheckResult): string {
  if (result.issues.length === 0) {
    return '✔ All checks passed. No issues found.';
  }

  const lines: string[] = ['Env Check Results:', ''];

  const errors = result.issues.filter(i => i.severity === 'error');
  const warns  = result.issues.filter(i => i.severity === 'warn');
  const infos  = result.issues.filter(i => i.severity === 'info');

  if (errors.length > 0) {
    lines.push('Errors:');
    errors.forEach(i => lines.push(formatIssue(i)));
    lines.push('');
  }

  if (warns.length > 0) {
    lines.push('Warnings:');
    warns.forEach(i => lines.push(formatIssue(i)));
    lines.push('');
  }

  if (infos.length > 0) {
    lines.push('Info:');
    infos.forEach(i => lines.push(formatIssue(i)));
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

export function formatCheckSummary(result: CheckResult): string {
  const total = result.passed + result.failed + result.warned;
  const parts = [
    `Total keys checked: ${total}`,
    `Passed: ${result.passed}`,
    `Errors: ${result.failed}`,
    `Warnings: ${result.warned}`,
  ];
  return parts.join('  |  ');
}
