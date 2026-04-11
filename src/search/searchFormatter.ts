import { SearchResult, SearchMatch } from './envSearch';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';

export function maskSearchValue(value: string, mask: boolean): string {
  return mask ? '****' : value;
}

export function formatMatchEntry(
  match: SearchMatch,
  query: string,
  maskValues: boolean,
  caseSensitive: boolean
): string {
  const badge =
    match.matchedOn === 'both'
      ? `${CYAN}[key+val]${RESET}`
      : match.matchedOn === 'key'
      ? `${YELLOW}[key]${RESET}`
      : `${GREEN}[val]${RESET}`;

  const displayValue = maskSearchValue(match.value, maskValues);
  const flags = caseSensitive ? '' : ' (ci)';
  return `  ${badge} ${BOLD}${match.key}${RESET}${DIM}=${RESET}${displayValue}${DIM}${flags}${RESET}`;
}

export function formatSearchResult(
  result: SearchResult,
  maskValues = false,
  caseSensitive = false
): string {
  const lines: string[] = [];
  lines.push(`${BOLD}Search results for "${result.query}"${RESET}`);

  if (result.matches.length === 0) {
    lines.push(`  ${DIM}No matches found.${RESET}`);
  } else {
    for (const match of result.matches) {
      lines.push(formatMatchEntry(match, result.query, maskValues, caseSensitive));
    }
  }

  return lines.join('\n');
}

export function formatSearchSummary(result: SearchResult): string {
  const { matches, totalScanned, query } = result;
  return (
    `Search "${query}": ${matches.length} match(es) across ${totalScanned} key(s) scanned.`
  );
}
