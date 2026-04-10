import { RotateResult, RotateSummary } from './envRotate';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';

export function formatRotateResult(result: RotateResult): string {
  if (result.rotated) {
    return `${GREEN}✔${RESET} ${result.key} — rotated successfully`;
  }
  return `${RED}✘${RESET} ${result.key} — ${result.error ?? 'unknown error'}`;
}

export function formatRotateSummary(summary: RotateSummary): string {
  const lines: string[] = [];

  lines.push(`${BOLD}Key Rotation Summary${RESET}`);
  lines.push('─'.repeat(40));

  for (const result of summary.results) {
    lines.push(formatRotateResult(result));
  }

  lines.push('─'.repeat(40));

  const totalLabel = `Total:   ${summary.total}`;
  const rotatedLabel = `${GREEN}Rotated: ${summary.rotated}${RESET}`;
  const failedLabel =
    summary.failed > 0
      ? `${RED}Failed:  ${summary.failed}${RESET}`
      : `${YELLOW}Failed:  ${summary.failed}${RESET}`;

  lines.push(totalLabel);
  lines.push(rotatedLabel);
  lines.push(failedLabel);

  return lines.join('\n');
}
