/**
 * castFormatter.ts — Format cast results for CLI output
 */

import type { CastResult, CastError } from './envCast';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';

export function formatCastError(error: CastError): string {
  return `  ${RED}✖${RESET} ${BOLD}${error.key}${RESET}: ${error.message}`;
}

export function formatCastResult(result: CastResult): string {
  const lines: string[] = [];
  const castedCount = Object.keys(result.casted).length - result.errors.length;

  if (result.errors.length === 0) {
    lines.push(`${GREEN}✔ All values cast successfully.${RESET}`);
  } else {
    lines.push(`${YELLOW}Cast completed with errors:${RESET}`);
    for (const err of result.errors) {
      lines.push(formatCastError(err));
    }
  }

  return lines.join('\n');
}

export function formatCastSummary(result: CastResult): string {
  const total = Object.keys(result.casted).length;
  const failed = result.errors.length;
  const succeeded = total - failed;

  const parts = [
    `${BOLD}Cast Summary${RESET}`,
    `  Total fields : ${total}`,
    `  ${GREEN}Succeeded    : ${succeeded}${RESET}`,
  ];

  if (failed > 0) {
    parts.push(`  ${RED}Failed       : ${failed}${RESET}`);
  }

  return parts.join('\n');
}
