import { TokenizedEntry, TokenizeResult, TokenType } from './envTokenize';

const TYPE_COLORS: Record<TokenType, string> = {
  string: '\x1b[32m',
  number: '\x1b[34m',
  boolean: '\x1b[33m',
  null: '\x1b[90m',
  url: '\x1b[36m',
  path: '\x1b[35m',
  json: '\x1b[31m',
};

const RESET = '\x1b[0m';

export function formatTokenEntry(entry: TokenizedEntry, noColor = false): string {
  const color = noColor ? '' : (TYPE_COLORS[entry.type] ?? '');
  const reset = noColor ? '' : RESET;
  const typeLabel = `[${entry.type.toUpperCase()}]`.padEnd(10);
  return `${color}${typeLabel}${reset} ${entry.key}=${entry.value}`;
}

export function formatTokenizeResult(result: TokenizeResult, noColor = false): string {
  if (result.entries.length === 0) {
    return 'No entries to tokenize.';
  }
  const lines = result.entries.map((e) => formatTokenEntry(e, noColor));
  return lines.join('\n');
}

export function formatTokenizeSummary(result: TokenizeResult): string {
  const total = result.entries.length;
  const lines: string[] = [`Tokenized ${total} entr${total === 1 ? 'y' : 'ies'}:`];

  const types = Object.entries(result.typeCounts) as [TokenType, number][];
  for (const [type, count] of types) {
    if (count > 0) {
      lines.push(`  ${type.padEnd(10)} ${count}`);
    }
  }

  return lines.join('\n');
}
