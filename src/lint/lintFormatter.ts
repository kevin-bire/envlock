import { LintIssue, LintResult } from './envLinter';

const SEVERITY_SYMBOLS: Record<LintIssue['severity'], string> = {
  error: '✖',
  warning: '⚠',
  info: 'ℹ',
};

const SEVERITY_LABELS: Record<LintIssue['severity'], string> = {
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export function formatIssue(issue: LintIssue): string {
  const symbol = SEVERITY_SYMBOLS[issue.severity];
  const label = SEVERITY_LABELS[issue.severity];
  return `  ${symbol} [${label}] ${issue.key}: ${issue.message}`;
}

export function formatLintResult(result: LintResult): string {
  const lines: string[] = [];

  if (result.passed) {
    lines.push('✔ Lint passed — no issues found.');
    return lines.join('\n');
  }

  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  const infos = result.issues.filter((i) => i.severity === 'info');

  lines.push('Lint Issues:');
  lines.push('');

  for (const issue of result.issues) {
    lines.push(formatIssue(issue));
  }

  lines.push('');
  lines.push(
    `Summary: ${result.issues.length} issue(s) — ` +
      `${errors.length} error(s), ${warnings.length} warning(s), ${infos.length} info(s)`
  );

  return lines.join('\n');
}
