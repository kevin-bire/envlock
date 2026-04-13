import { BoundaryResult, BoundaryViolation } from './envBoundary';

export function formatViolation(violation: BoundaryViolation): string {
  const parts: string[] = [];
  parts.push(`  ✖ ${violation.key}`);
  if (violation.minLength !== undefined && violation.actualLength !== undefined) {
    parts.push(`    min length: ${violation.minLength}, actual: ${violation.actualLength}`);
  }
  if (violation.maxLength !== undefined && violation.actualLength !== undefined) {
    parts.push(`    max length: ${violation.maxLength}, actual: ${violation.actualLength}`);
  }
  if (violation.pattern !== undefined) {
    parts.push(`    pattern: ${violation.pattern} (no match)`);
  }
  if (violation.allowedValues !== undefined) {
    parts.push(`    allowed: [${violation.allowedValues.join(', ')}], got: "${violation.actualValue}"`);
  }
  if (violation.reason) {
    parts.push(`    reason: ${violation.reason}`);
  }
  return parts.join('\n');
}

export function formatBoundaryResult(result: BoundaryResult): string {
  const lines: string[] = [];
  lines.push('Boundary Check Results');
  lines.push('='.repeat(22));

  if (result.violations.length === 0) {
    lines.push('✔ All keys passed boundary checks.');
  } else {
    lines.push(`Found ${result.violations.length} violation(s):`);
    lines.push('');
    for (const violation of result.violations) {
      lines.push(formatViolation(violation));
    }
  }

  return lines.join('\n');
}

export function formatBoundarySummary(result: BoundaryResult): string {
  const total = result.checked;
  const passed = total - result.violations.length;
  const failed = result.violations.length;
  const status = failed === 0 ? '✔ PASS' : '✖ FAIL';
  return `Boundary: ${status} | checked: ${total}, passed: ${passed}, failed: ${failed}`;
}
