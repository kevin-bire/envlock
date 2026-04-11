import { formatMatchEntry, formatSearchResult, formatSearchSummary, maskSearchValue } from '../searchFormatter';
import { SearchMatch, SearchResult } from '../envSearch';

describe('maskSearchValue', () => {
  it('masks value when mask is true', () => {
    expect(maskSearchValue('secret', true)).toBe('****');
  });

  it('returns original value when mask is false', () => {
    expect(maskSearchValue('secret', false)).toBe('secret');
  });
});

describe('formatMatchEntry', () => {
  it('includes key and value in output', () => {
    const match: SearchMatch = { key: 'API_KEY', value: 'abc123', matchedOn: 'key' };
    const result = formatMatchEntry(match, 'API', false, false);
    expect(result).toContain('API_KEY');
    expect(result).toContain('abc123');
  });

  it('masks value when maskValues is true', () => {
    const match: SearchMatch = { key: 'SECRET', value: 'topsecret', matchedOn: 'value' };
    const result = formatMatchEntry(match, 'top', true, false);
    expect(result).toContain('****');
    expect(result).not.toContain('topsecret');
  });

  it('shows [key+val] badge for both matches', () => {
    const match: SearchMatch = { key: 'LOCALHOST', value: 'localhost', matchedOn: 'both' };
    const result = formatMatchEntry(match, 'localhost', false, false);
    expect(result).toContain('[key+val]');
  });
});

describe('formatSearchResult', () => {
  it('shows no matches message when empty', () => {
    const result: SearchResult = { query: 'xyz', matches: [], totalScanned: 5 };
    const output = formatSearchResult(result);
    expect(output).toContain('No matches found');
  });

  it('includes query in header', () => {
    const result: SearchResult = { query: 'DB', matches: [], totalScanned: 3 };
    const output = formatSearchResult(result);
    expect(output).toContain('DB');
  });

  it('renders all matches', () => {
    const matches: SearchMatch[] = [
      { key: 'DB_HOST', value: 'localhost', matchedOn: 'key' },
      { key: 'DB_PORT', value: '5432', matchedOn: 'key' },
    ];
    const result: SearchResult = { query: 'DB', matches, totalScanned: 5 };
    const output = formatSearchResult(result);
    expect(output).toContain('DB_HOST');
    expect(output).toContain('DB_PORT');
  });
});

describe('formatSearchSummary', () => {
  it('returns summary string with match count and scanned count', () => {
    const result: SearchResult = {
      query: 'API',
      matches: [{ key: 'API_KEY', value: 'x', matchedOn: 'key' }],
      totalScanned: 10,
    };
    const summary = formatSearchSummary(result);
    expect(summary).toContain('1 match(es)');
    expect(summary).toContain('10 key(s) scanned');
    expect(summary).toContain('API');
  });
});
