import { EnvValidateResult } from './envValidate';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';

export function formatValidationResult(
  result: EnvValidateResult,
  useColor = true
): string {
  const lines: string[] = [];
  const c = (code: string, text: string) =>
    useColor ? `${code}${text}${RESET}` : text;

  const status = result.valid
    ? c(GREEN + BOLD, '✔ VALID')
    : c(RED + BOLD, '✘ INVALID');

  lines.push(`${status}`);

  if (result.errors.length > 0) {
    lines.push(c(RED, `\nErrors (${result.errors.length}):`) );
    for (const err of result.errors) {
      lines.push(`  ${c(RED, '✘')} ${err}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(c(YELLOW, `\nWarnings (${result.warnings.length}):`) );
    for (const warn of result.warnings) {
      lines.push(`  ${c(YELLOW, '!')} ${warn}`);
    }
  }

  if (result.missingKeys.length > 0) {
    lines.push(`\nMissing keys: ${result.missingKeys.map(k => c(RED, k)).join(', ')}`);
  }

  if (result.extraKeys.length > 0) {
    lines.push(`\nExtra keys:   ${result.extraKeys.map(k => c(YELLOW, k)).join(', ')}`);
  }

  return lines.join('\n');
}

export function formatValidationSummary(
  result: EnvValidateResult,
  useColor = true
): string {
  const c = (code: string, text: string) =>
    useColor ? `${code}${text}${RESET}` : text;
  const status = result.valid
    ? c(GREEN, 'passed')
    : c(RED, 'failed');
  return `Validation ${status}: ${result.errors.length} error(s), ${result.warnings.length} warning(s)`;
}
