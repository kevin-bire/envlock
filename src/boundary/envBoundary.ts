import { ParsedEnv } from '../parser/envParser';

export interface BoundaryRule {
  key: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  allowEmpty?: boolean;
}

export interface BoundaryViolation {
  key: string;
  value: string;
  rule: string;
  message: string;
}

export interface BoundaryResult {
  valid: boolean;
  violations: BoundaryViolation[];
  checkedKeys: number;
}

export function checkBoundaries(
  env: ParsedEnv,
  rules: BoundaryRule[]
): BoundaryResult {
  const violations: BoundaryViolation[] = [];

  for (const rule of rules) {
    const value = env[rule.key];

    if (value === undefined) continue;

    if (!rule.allowEmpty && value === '') {
      violations.push({
        key: rule.key,
        value,
        rule: 'allowEmpty',
        message: `Key "${rule.key}" must not be empty`,
      });
      continue;
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
      violations.push({
        key: rule.key,
        value,
        rule: 'minLength',
        message: `Key "${rule.key}" length ${value.length} is below minimum ${rule.minLength}`,
      });
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      violations.push({
        key: rule.key,
        value,
        rule: 'maxLength',
        message: `Key "${rule.key}" length ${value.length} exceeds maximum ${rule.maxLength}`,
      });
    }

    const numeric = parseFloat(value);
    if (!isNaN(numeric)) {
      if (rule.minValue !== undefined && numeric < rule.minValue) {
        violations.push({
          key: rule.key,
          value,
          rule: 'minValue',
          message: `Key "${rule.key}" value ${numeric} is below minimum ${rule.minValue}`,
        });
      }
      if (rule.maxValue !== undefined && numeric > rule.maxValue) {
        violations.push({
          key: rule.key,
          value,
          rule: 'maxValue',
          message: `Key "${rule.key}" value ${numeric} exceeds maximum ${rule.maxValue}`,
        });
      }
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      violations.push({
        key: rule.key,
        value,
        rule: 'pattern',
        message: `Key "${rule.key}" value does not match required pattern`,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    checkedKeys: rules.filter((r) => env[r.key] !== undefined).length,
  };
}
