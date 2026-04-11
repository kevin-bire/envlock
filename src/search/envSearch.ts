import { ParsedEnv } from '../parser/envParser';

export interface SearchOptions {
  caseSensitive?: boolean;
  searchKeys?: boolean;
  searchValues?: boolean;
  exact?: boolean;
}

export interface SearchMatch {
  key: string;
  value: string;
  matchedOn: 'key' | 'value' | 'both';
}

export interface SearchResult {
  query: string;
  matches: SearchMatch[];
  totalScanned: number;
}

export function searchEnv(
  env: ParsedEnv,
  query: string,
  options: SearchOptions = {}
): SearchResult {
  const {
    caseSensitive = false,
    searchKeys = true,
    searchValues = true,
    exact = false,
  } = options;

  const normalize = (s: string) => (caseSensitive ? s : s.toLowerCase());
  const normalizedQuery = normalize(query);

  const matches: SearchMatch[] = [];

  for (const [key, value] of Object.entries(env)) {
    const normalizedKey = normalize(key);
    const normalizedValue = normalize(value);

    const keyMatch = searchKeys &&
      (exact ? normalizedKey === normalizedQuery : normalizedKey.includes(normalizedQuery));
    const valueMatch = searchValues &&
      (exact ? normalizedValue === normalizedQuery : normalizedValue.includes(normalizedQuery));

    if (keyMatch && valueMatch) {
      matches.push({ key, value, matchedOn: 'both' });
    } else if (keyMatch) {
      matches.push({ key, value, matchedOn: 'key' });
    } else if (valueMatch) {
      matches.push({ key, value, matchedOn: 'value' });
    }
  }

  return {
    query,
    matches,
    totalScanned: Object.keys(env).length,
  };
}
