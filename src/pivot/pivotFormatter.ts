import { PivotResult } from './envPivot';

export function formatPivotEntry(key: string, values: Record<string, string>): string {
  const parts = Object.entries(values)
    .map(([env, val]) => `  ${env}: ${val}`)
    .join('\n');
  return `[${key}]\n${parts}`;
}

export function formatPivotResult(result: PivotResult): string {
  const lines: string[] = [];

  lines.push('Pivot Result:');
  lines.push(`  Environments : ${result.environments.join(', ')}`);
  lines.push(`  Keys         : ${result.keys.length}`);
  lines.push('');

  for (const key of result.keys) {
    const values = result.pivot[key] ?? {};
    lines.push(formatPivotEntry(key, values));
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

export function formatPivotSummary(result: PivotResult): string {
  const consistent = result.keys.filter((key) => {
    const values = Object.values(result.pivot[key] ?? {});
    return values.length > 0 && new Set(values).size === 1;
  });

  const inconsistent = result.keys.filter((key) => {
    const values = Object.values(result.pivot[key] ?? {});
    return new Set(values).size > 1;
  });

  const missing = result.keys.filter((key) => {
    const envCount = Object.keys(result.pivot[key] ?? {}).length;
    return envCount < result.environments.length;
  });

  return [
    `Pivot Summary:`,
    `  Total keys   : ${result.keys.length}`,
    `  Consistent   : ${consistent.length}`,
    `  Inconsistent : ${inconsistent.length}`,
    `  Missing vals : ${missing.length}`,
  ].join('\n');
}
