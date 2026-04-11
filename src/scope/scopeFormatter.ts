import { ScopeResult } from './envScope';

export function formatScopeEntry(key: string, scope: string): string {
  return `  [${scope.toUpperCase()}] ${key}`;
}

export function formatScopeResult(
  result: ScopeResult,
  scopes: string[]
): string {
  const lines: string[] = [];

  lines.push(`Scope filter: ${scopes.join(', ')}`);
  lines.push('');

  if (result.matched.length > 0) {
    lines.push(`Matched keys (${result.matched.length}):`);
    for (const key of result.matched) {
      lines.push(`  ✔ ${key}`);
    }
  } else {
    lines.push('No keys matched the given scopes.');
  }

  if (result.unmatched.length > 0) {
    lines.push('');
    lines.push(`Unmatched keys (${result.unmatched.length}):`);
    for (const key of result.unmatched) {
      lines.push(`  - ${key}`);
    }
  }

  return lines.join('\n');
}

export function formatScopeSummary(
  result: ScopeResult,
  scopes: string[]
): string {
  const total = result.matched.length + result.unmatched.length;
  return (
    `Scopes: ${scopes.join(', ')} | ` +
    `Total: ${total} | ` +
    `Matched: ${result.matched.length} | ` +
    `Unmatched: ${result.unmatched.length}`
  );
}
