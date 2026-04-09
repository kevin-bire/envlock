import { ParsedEnv } from '../parser/envParser';

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintIssue {
  key: string;
  message: string;
  severity: LintSeverity;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
}

const SENSITIVE_PATTERNS = /secret|password|passwd|token|api_key|private|auth/i;
const PLACEHOLDER_PATTERNS = /^(todo|fixme|changeme|replace_me|your_.*_here|xxx+)$/i;
const EMPTY_VALUE_KEYS = /secret|password|token|key/i;

export function lintEnv(env: ParsedEnv): LintResult {
  const issues: LintIssue[] = [];

  for (const [key, value] of Object.entries(env)) {
    // Warn on keys with sensitive names but empty values
    if (EMPTY_VALUE_KEYS.test(key) && value.trim() === '') {
      issues.push({
        key,
        message: `Sensitive key "${key}" has an empty value.`,
        severity: 'error',
      });
    }

    // Warn on placeholder values
    if (PLACEHOLDER_PATTERNS.test(value.trim())) {
      issues.push({
        key,
        message: `Value for "${key}" appears to be a placeholder: "${value}".`,
        severity: 'warning',
      });
    }

    // Warn if sensitive value looks like it may be committed in plain text
    if (SENSITIVE_PATTERNS.test(key) && value.length > 0 && !value.startsWith('enc:')) {
      issues.push({
        key,
        message: `Sensitive key "${key}" has a plain-text value. Consider encrypting it.`,
        severity: 'warning',
      });
    }

    // Warn on keys with whitespace
    if (/\s/.test(key)) {
      issues.push({
        key,
        message: `Key "${key}" contains whitespace, which may cause issues.`,
        severity: 'error',
      });
    }

    // Info: uppercase convention
    if (key !== key.toUpperCase()) {
      issues.push({
        key,
        message: `Key "${key}" is not uppercase. Convention recommends uppercase env keys.`,
        severity: 'info',
      });
    }
  }

  return {
    issues,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
  };
}
