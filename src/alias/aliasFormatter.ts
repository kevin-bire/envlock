import { AliasResult } from './envAlias';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';

export function formatAppliedEntry(alias: string, original: string, value: string): string {
  const masked = value.length > 0 ? '*'.repeat(Math.min(value.length, 8)) : '(empty)';
  return `  ${GREEN}+${RESET} ${alias} ${DIM}<- ${original}${RESET} = ${masked}`;
}

export function formatMissingEntry(original: string): string {
  return `  ${YELLOW}?${RESET} ${original} ${DIM}(not found in env)${RESET}`;
}

export function formatConflictEntry(alias: string): string {
  return `  ${RED}!${RESET} ${alias} ${DIM}(already exists, skipped)${RESET}`;
}

export function formatAliasResult(result: AliasResult): string {
  const lines: string[] = [];

  if (result.applied.length > 0) {
    lines.push('Applied aliases:');
    for (const { alias, original, value } of result.applied) {
      lines.push(formatAppliedEntry(alias, original, value));
    }
  }

  if (result.missing.length > 0) {
    lines.push('Missing source keys:');
    for (const key of result.missing) {
      lines.push(formatMissingEntry(key));
    }
  }

  if (result.conflicts.length > 0) {
    lines.push('Conflicts (alias already set):');
    for (const alias of result.conflicts) {
      lines.push(formatConflictEntry(alias));
    }
  }

  return lines.join('\n');
}

export function formatAliasSummary(result: AliasResult): string {
  const parts = [
    `${GREEN}${result.applied.length} applied${RESET}`,
    `${YELLOW}${result.missing.length} missing${RESET}`,
    `${RED}${result.conflicts.length} conflicts${RESET}`,
  ];
  return `Alias summary: ${parts.join(' | ')}`;
}
