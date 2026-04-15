import { InheritResult } from './envInherit';

export function formatInheritedEntry(key: string, value: string): string {
  return `  ✦ ${key}=${value}  (inherited)`;
}

export function formatOverriddenEntry(
  key: string,
  baseValue: string,
  overrideValue: string
): string {
  return `  ↑ ${key}: "${baseValue}" → "${overrideValue}"  (overridden)`;
}

export function formatAddedEntry(key: string, value: string): string {
  return `  + ${key}=${value}  (new in override)`;
}

export function formatInheritResult(result: InheritResult): string {
  const lines: string[] = [
    `Inherit: ${result.base} → ${result.override}`,
    '',
  ];

  if (result.inherited.length > 0) {
    lines.push('Inherited from base:');
    for (const key of result.inherited) {
      lines.push(formatInheritedEntry(key, result.merged[key]));
    }
    lines.push('');
  }

  if (result.overridden.length > 0) {
    lines.push('Overridden keys:');
    for (const key of result.overridden) {
      lines.push(formatOverriddenEntry(key, '', result.merged[key]));
    }
    lines.push('');
  }

  if (result.added.length > 0) {
    lines.push('Added by override:');
    for (const key of result.added) {
      lines.push(formatAddedEntry(key, result.merged[key]));
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

export function formatInheritSummary(result: InheritResult): string {
  return [
    `Inherited: ${result.inherited.length}`,
    `Overridden: ${result.overridden.length}`,
    `Added: ${result.added.length}`,
    `Total keys: ${Object.keys(result.merged).length}`,
  ].join('  |  ');
}
