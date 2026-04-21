import { TransformChange, TransformResult } from './envTransform';

const MASK = '****';

const SENSITIVE_PATTERN = /secret|password|token|key|pwd|auth/i;

function maskTransformValue(key: string, value: string): string {
  return SENSITIVE_PATTERN.test(key) ? MASK : value;
}

export function formatTransformChange(change: TransformChange): string {
  const before = maskTransformValue(change.key, change.before);
  const after = maskTransformValue(change.key, change.after);
  return `  ~ ${change.key}: "${before}" → "${after}"`;
}

export function formatTransformResult(result: TransformResult): string {
  if (result.changes.length === 0) {
    return 'No changes applied.';
  }

  const lines: string[] = ['Transform changes:'];
  for (const change of result.changes) {
    lines.push(formatTransformChange(change));
  }
  return lines.join('\n');
}

export function formatTransformSummary(result: TransformResult): string {
  const total = Object.keys(result.original).length;
  const changed = result.changes.length;
  const unchanged = total - changed;
  return [
    `Total keys : ${total}`,
    `Changed    : ${changed}`,
    `Unchanged  : ${unchanged}`,
  ].join('\n');
}

/**
 * Returns a combined report of the transform result and summary,
 * separated by a blank line for readability.
 */
export function formatTransformReport(result: TransformResult): string {
  return [formatTransformResult(result), formatTransformSummary(result)].join('\n\n');
}
