import { SwapOperation, SwapResult } from './envSwap';

export function formatSwapOperation(op: SwapOperation, mode: 'keys' | 'values'): string {
  const label = mode === 'keys' ? 'keys' : 'values';
  return `  ↔ swapped ${label}: ${op.keyA} <-> ${op.keyB}`;
}

export function formatSkippedOperation(op: SwapOperation): string {
  return `  ✗ skipped (missing key): ${op.keyA} <-> ${op.keyB}`;
}

export function formatSwapResult(
  result: SwapResult,
  mode: 'keys' | 'values'
): string {
  const lines: string[] = [];

  if (result.swapped.length > 0) {
    lines.push(`Swapped ${mode}:`);
    for (const op of result.swapped) {
      lines.push(formatSwapOperation(op, mode));
    }
  }

  if (result.skipped.length > 0) {
    lines.push(`Skipped:`);
    for (const op of result.skipped) {
      lines.push(formatSkippedOperation(op));
    }
  }

  return lines.join('\n');
}

export function formatSwapSummary(result: SwapResult, mode: 'keys' | 'values'): string {
  const parts: string[] = [
    `Swap ${mode} complete.`,
    `  Swapped : ${result.totalSwaps}`,
    `  Skipped : ${result.skipped.length}`,
  ];
  return parts.join('\n');
}
