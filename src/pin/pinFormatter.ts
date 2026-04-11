export interface PinEntry {
  key: string;
  pinnedValue: string;
  currentValue: string | undefined;
  matched: boolean;
}

export interface PinResult {
  pinned: string[];
  unpinned: string[];
  violations: PinEntry[];
  checked: PinEntry[];
}

export function formatPinEntry(entry: PinEntry): string {
  const status = entry.matched ? '✔' : '✘';
  const current = entry.currentValue !== undefined ? entry.currentValue : '(missing)';
  return `  ${status} ${entry.key}: pinned=${entry.pinnedValue} current=${current}`;
}

export function formatPinResult(result: PinResult): string {
  const lines: string[] = [];

  if (result.pinned.length > 0) {
    lines.push(`Pinned keys (${result.pinned.length}):`);
    result.pinned.forEach((k) => lines.push(`  + ${k}`));
  }

  if (result.unpinned.length > 0) {
    lines.push(`Unpinned keys (${result.unpinned.length}):`);
    result.unpinned.forEach((k) => lines.push(`  - ${k}`));
  }

  if (result.checked.length > 0) {
    lines.push(`Checked pins (${result.checked.length}):`);
    result.checked.forEach((e) => lines.push(formatPinEntry(e)));
  }

  return lines.join('\n');
}

export function formatPinSummary(result: PinResult): string {
  const parts: string[] = [];

  if (result.pinned.length > 0) {
    parts.push(`${result.pinned.length} pinned`);
  }
  if (result.unpinned.length > 0) {
    parts.push(`${result.unpinned.length} unpinned`);
  }
  if (result.violations.length > 0) {
    parts.push(`${result.violations.length} violation(s)`);
  } else if (result.checked.length > 0) {
    parts.push('all pins valid');
  }

  return parts.length > 0 ? parts.join(', ') : 'no changes';
}
