/**
 * Formatter for env wrap/unwrap operation results.
 * Provides human-readable output for wrapped and unwrapped entries.
 */

import type { WrapResult } from './envWrap';

/**
 * Format a single wrap change entry.
 */
export function formatWrapChange(
  key: string,
  before: string,
  after: string,
  action: 'wrapped' | 'unwrapped' | 'skipped'
): string {
  const symbol =
    action === 'wrapped' ? '✔' : action === 'unwrapped' ? '✂' : '–';
  return `  ${symbol} ${key}: ${JSON.stringify(before)} → ${JSON.stringify(after)}`;
}

/**
 * Format the full wrap result with all changed entries.
 */
export function formatWrapResult(result: WrapResult): string {
  const lines: string[] = [];

  if (result.wrapped.length > 0) {
    lines.push('Wrapped:');
    for (const { key, before, after } of result.wrapped) {
      lines.push(formatWrapChange(key, before, after, 'wrapped'));
    }
  }

  if (result.unwrapped.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('Unwrapped:');
    for (const { key, before, after } of result.unwrapped) {
      lines.push(formatWrapChange(key, before, after, 'unwrapped'));
    }
  }

  if (result.skipped.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('Skipped (already in target state):');
    for (const key of result.skipped) {
      lines.push(`  – ${key}`);
    }
  }

  if (lines.length === 0) {
    lines.push('No changes made.');
  }

  return lines.join('\n');
}

/**
 * Format a concise summary line for the wrap operation.
 */
export function formatWrapSummary(result: WrapResult): string {
  const parts: string[] = [];

  if (result.wrapped.length > 0) {
    parts.push(`${result.wrapped.length} wrapped`);
  }
  if (result.unwrapped.length > 0) {
    parts.push(`${result.unwrapped.length} unwrapped`);
  }
  if (result.skipped.length > 0) {
    parts.push(`${result.skipped.length} skipped`);
  }

  if (parts.length === 0) {
    return 'Wrap: no changes.';
  }

  return `Wrap summary: ${parts.join(', ')}.`;
}
