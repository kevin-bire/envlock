import { formatSummarizeResult, formatSummarizeSummary, formatPrefixRow } from '../summarizeFormatter';
import { SummarizeResult } from '../envSummarize';

const baseResult: SummarizeResult = {
  total: 5,
  empty: 1,
  nonEmpty: 4,
  prefixes: { DB: 2, APP: 1 },
  longestKey: 'DB_PASSWORD',
  shortestKey: 'APP',
  averageValueLength: 8,
  uniqueValues: 4,
};

describe('formatPrefixRow', () => {
  it('formats a prefix row with plural keys', () => {
    expect(formatPrefixRow('DB', 2)).toBe('  DB_*  →  2 keys');
  });

  it('formats a prefix row with singular key', () => {
    expect(formatPrefixRow('APP', 1)).toBe('  APP_*  →  1 key');
  });
});

describe('formatSummarizeResult', () => {
  it('includes total, empty, nonEmpty counts', () => {
    const output = formatSummarizeResult(baseResult);
    expect(output).toContain('Total keys      : 5');
    expect(output).toContain('Non-empty       : 4');
    expect(output).toContain('Empty           : 1');
  });

  it('includes unique values and avg length', () => {
    const output = formatSummarizeResult(baseResult);
    expect(output).toContain('Unique values   : 4');
    expect(output).toContain('Avg value length: 8');
  });

  it('includes longest and shortest keys', () => {
    const output = formatSummarizeResult(baseResult);
    expect(output).toContain('DB_PASSWORD');
    expect(output).toContain('APP');
  });

  it('includes prefix section when prefixes exist', () => {
    const output = formatSummarizeResult(baseResult);
    expect(output).toContain('Prefixes');
    expect(output).toContain('DB_*');
    expect(output).toContain('APP_*');
  });

  it('omits prefix section when no prefixes', () => {
    const result = { ...baseResult, prefixes: {} };
    const output = formatSummarizeResult(result);
    expect(output).not.toContain('Prefixes');
  });

  it('handles empty result gracefully', () => {
    const empty: SummarizeResult = {
      total: 0, empty: 0, nonEmpty: 0,
      prefixes: {}, longestKey: '', shortestKey: '',
      averageValueLength: 0, uniqueValues: 0,
    };
    const output = formatSummarizeResult(empty);
    expect(output).toContain('Total keys      : 0');
  });
});

describe('formatSummarizeSummary', () => {
  it('includes key count and prefix groups', () => {
    const summary = formatSummarizeSummary(baseResult);
    expect(summary).toContain('5 keys');
    expect(summary).toContain('2 prefix groups');
  });

  it('mentions empty keys when present', () => {
    const summary = formatSummarizeSummary(baseResult);
    expect(summary).toContain('1 empty');
  });

  it('omits empty mention when none are empty', () => {
    const result = { ...baseResult, empty: 0 };
    const summary = formatSummarizeSummary(result);
    expect(summary).not.toContain('empty');
  });

  it('uses singular prefix group', () => {
    const result = { ...baseResult, prefixes: { DB: 2 } };
    const summary = formatSummarizeSummary(result);
    expect(summary).toContain('1 prefix group');
    expect(summary).not.toContain('groups');
  });
});
