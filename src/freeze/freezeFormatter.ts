import { FreezeResult, DriftResult, DriftEntry } from './envFreeze';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

export function formatFreezeResult(result: FreezeResult): string {
  const lines: string[] = [];

  for (const entry of result.frozen) {
    lines.push(`  ${GREEN}❄ ${entry.key}${RESET} = ${DIM}${entry.value}${RESET}`);
  }

  for (const key of result.skipped) {
    lines.push(`  ${YELLOW}⚠ ${key}${RESET} ${DIM}(not found, skipped)${RESET}`);
  }

  return lines.join('\n');
}

export function formatFreezeSummary(result: FreezeResult): string {
  const parts: string[] = [];
  if (result.frozenCount > 0)
    parts.push(`${GREEN}${result.frozenCount} frozen${RESET}`);
  if (result.skippedCount > 0)
    parts.push(`${YELLOW}${result.skippedCount} skipped${RESET}`);
  return `Freeze complete: ${parts.join(', ')}`;
}

export function formatDriftEntry(entry: DriftEntry): string {
  if (entry.currentValue === undefined) {
    return `  ${RED}✗ ${entry.key}${RESET} ${DIM}(missing — was "${entry.frozenValue}")${RESET}`;
  }
  if (entry.drifted) {
    return (
      `  ${RED}~ ${entry.key}${RESET}\n` +
      `    ${DIM}frozen:  ${entry.frozenValue}${RESET}\n` +
      `    ${CYAN}current: ${entry.currentValue}${RESET}`
    );
  }
  return `  ${GREEN}✓ ${entry.key}${RESET} ${DIM}(unchanged)${RESET}`;
}

export function formatDriftResult(result: DriftResult): string {
  const lines = result.entries.map(formatDriftEntry);
  return lines.join('\n');
}

export function formatDriftSummary(result: DriftResult): string {
  if (result.clean) {
    return `${GREEN}✓ No drift detected. All frozen keys match.${RESET}`;
  }
  const parts: string[] = [];
  if (result.driftedCount > 0)
    parts.push(`${RED}${result.driftedCount} drifted${RESET}`);
  if (result.missingCount > 0)
    parts.push(`${RED}${result.missingCount} missing${RESET}`);
  return `${RED}✗ Drift detected:${RESET} ${parts.join(', ')}`;
}
