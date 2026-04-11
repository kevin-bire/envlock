import { RequiredEnvResult, RequiredCheckResult } from './envRequired';

const PASS = '✔';
const FAIL = '✘';

export function formatCheckEntry(check: RequiredCheckResult): string {
  const icon = check.present ? PASS : FAIL;
  const status = check.present ? 'present' : 'MISSING';
  return `  ${icon} ${check.key}: ${status}`;
}

export function formatRequiredResult(result: RequiredEnvResult): string {
  const lines: string[] = ['Required Keys Check:'];

  for (const check of result.checks) {
    lines.push(formatCheckEntry(check));
  }

  return lines.join('\n');
}

export function formatRequiredSummary(result: RequiredEnvResult): string {
  const total = result.checks.length;
  const presentCount = result.present.length;
  const missingCount = result.missing.length;

  const lines: string[] = [
    `Required: ${total} keys checked — ${presentCount} present, ${missingCount} missing`,
  ];

  if (!result.allSatisfied) {
    lines.push(`Missing keys: ${result.missing.join(', ')}`);
  } else {
    lines.push('All required keys are present.');
  }

  return lines.join('\n');
}
