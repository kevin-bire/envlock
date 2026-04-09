import { LintResult, LintIssue, LintSeverity } from './envLinter';

const SEVERITY_ICONS: Record<LintSeverity, string> = {
  error: '✖',
  warning: '⚠',
  info: 'ℹ',
};

const SEVERITY_LABELS: Record<LintSeverity, string> = {
  error: 'ERROR',
  warning: 'WARN ',
  info: 'INFO ',
};

export function formatIssue(issue: LintIssue): string {
  const icon = SEVERITY_ICONS[issue.severity];
  const label = SEVERITY_LABELS[issue.severity];
  return `  ${icon} [${label}] ${issue.key}: ${issue.message}`;
}

export function formatLintResult(result: LintResult, filePath?: string): string {
  const lines: string[] = [];

  const header = filePath ? `Lint results for: ${filePath}` : 'Lint results';
  lines.push(header);
  lines.push('─'.repeat(50));

  if (result.issues.length === 0) {
    lines.push('  ✔ No issues found.');
  } else {
    for (const issue of result.issues) {
      lines.push(formatIssue(issue));
    }
  }

  lines.push('─'.repeat(50));
  lines.push(
    `Summary: ${result.errorCount} error(s), ${result.warningCount} warning(s), ` +
      `${result.issues.filter((i) => i.severity === 'info').length} info(s)`
  );

  return lines.join('\n');
}
