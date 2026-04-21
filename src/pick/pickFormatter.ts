import { EnvMap } from '../parser/envParser';
import { PickResult } from './envPick';

function maskPickValue(value: string, mask: boolean): string {
  return mask ? '****' : value;
}

export function formatPickedEntry(
  key: string,
  value: string,
  mask = false
): string {
  return `  ${key}=${maskPickValue(value, mask)}`;
}

export function formatPickResult(result: PickResult, mask = false): string {
  const lines: string[] = ['Picked entries:'];

  if (result.total === 0) {
    lines.push('  (none)');
  } else {
    for (const [key, value] of Object.entries(result.picked)) {
      lines.push(formatPickedEntry(key, value, mask));
    }
  }

  if (result.missing.length > 0) {
    lines.push('');
    lines.push('Missing keys:');
    for (const key of result.missing) {
      lines.push(`  - ${key}`);
    }
  }

  return lines.join('\n');
}

export function formatPickSummary(result: PickResult): string {
  const parts: string[] = [
    `Picked: ${result.total}`,
    `Missing: ${result.missing.length}`,
  ];
  return parts.join(' | ');
}
