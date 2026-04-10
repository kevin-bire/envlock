import { RenameResult, RenameOperation } from './envRename';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';

export function formatOperation(op: RenameOperation, status: 'renamed' | 'skipped' | 'notFound'): string {
  const arrow = `${op.oldKey} → ${op.newKey}`;
  switch (status) {
    case 'renamed':
      return `  ${GREEN}✔ ${arrow}${RESET}`;
    case 'skipped':
      return `  ${YELLOW}⚠ ${arrow} (target key already exists)${RESET}`;
    case 'notFound':
      return `  ${RED}✘ ${arrow} (source key not found)${RESET}`;
  }
}

export function formatRenameResult(result: RenameResult): string {
  const lines: string[] = [`${BOLD}Rename Operations:${RESET}`];

  if (result.renamed.length > 0) {
    lines.push(`\n${GREEN}Renamed:${RESET}`);
    result.renamed.forEach((op) => lines.push(formatOperation(op, 'renamed')));
  }

  if (result.skipped.length > 0) {
    lines.push(`\n${YELLOW}Skipped:${RESET}`);
    result.skipped.forEach((op) => lines.push(formatOperation(op, 'skipped')));
  }

  if (result.notFound.length > 0) {
    lines.push(`\n${RED}Not Found:${RESET}`);
    result.notFound.forEach((op) => lines.push(formatOperation(op, 'notFound')));
  }

  return lines.join('\n');
}

export function formatRenameSummary(result: RenameResult): string {
  const { renamed, skipped, notFound } = result;
  return [
    `${BOLD}Summary:${RESET}`,
    `  ${GREEN}Renamed   : ${renamed.length}${RESET}`,
    `  ${YELLOW}Skipped   : ${skipped.length}${RESET}`,
    `  ${RED}Not Found : ${notFound.length}${RESET}`,
  ].join('\n');
}

/**
 * Returns a combined formatted string with both the full operation list
 * and the summary, separated by a blank line.
 */
export function formatRenameReport(result: RenameResult): string {
  return [formatRenameResult(result), '', formatRenameSummary(result)].join('\n');
}
