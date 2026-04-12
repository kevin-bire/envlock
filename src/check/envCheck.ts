import { EnvMap } from '../parser/envParser';

export type CheckSeverity = 'error' | 'warn' | 'info';

export interface CheckIssue {
  key: string;
  rule: string;
  message: string;
  severity: CheckSeverity;
}

export interface CheckResult {
  issues: CheckIssue[];
  passed: number;
  failed: number;
  warned: number;
}

const SENSITIVE_PATTERNS = /secret|password|token|key|auth|private/i;
const PLACEHOLDER_PATTERN = /^(CHANGE_ME|TODO|FIXME|PLACEHOLDER|<.*>|\{\{.*\}\})$/i;
const EMPTY_VALUE_KEYS = /required|mandatory|must/i;

export function checkEnv(env: EnvMap, strict = false): CheckResult {
  const issues: CheckIssue[] = [];

  for (const [key, value] of Object.entries(env)) {
    // Rule: no empty values for sensitive keys
    if (SENSITIVE_PATTERNS.test(key) && value.trim() === '') {
      issues.push({
        key,
        rule: 'sensitive-empty',
        message: `Sensitive key "${key}" has an empty value`,
        severity: 'error',
      });
    }

    // Rule: placeholder values detected
    if (PLACEHOLDER_PATTERN.test(value.trim())) {
      issues.push({
        key,
        rule: 'placeholder-value',
        message: `Key "${key}" appears to contain a placeholder value: "${value}"`,
        severity: strict ? 'error' : 'warn',
      });
    }

    // Rule: keys with 'required' in name must not be empty
    if (EMPTY_VALUE_KEYS.test(key) && value.trim() === '') {
      issues.push({
        key,
        rule: 'required-empty',
        message: `Key "${key}" suggests it is required but has no value`,
        severity: 'error',
      });
    }

    // Rule: key naming convention (should be UPPER_SNAKE_CASE)
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
      issues.push({
        key,
        rule: 'key-naming',
        message: `Key "${key}" does not follow UPPER_SNAKE_CASE convention`,
        severity: strict ? 'error' : 'warn',
      });
    }
  }

  const failed = issues.filter(i => i.severity === 'error').length;
  const warned = issues.filter(i => i.severity === 'warn').length;
  const passed = Object.keys(env).length - new Set(issues.map(i => i.key)).size;

  return { issues, passed, failed, warned };
}
