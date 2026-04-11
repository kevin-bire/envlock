import { findDuplicates, dedupeEnv } from '../envDedupe';
import { formatDuplicateEntry, formatDedupeResult, formatDedupeSummary } from '../dedupeFormatter';

describe('findDuplicates', () => {
  it('returns empty array when no duplicates exist', () => {
    const entries = [
      { key: 'FOO', value: 'bar' },
      { key: 'BAZ', value: 'qux' },
    ];
    expect(findDuplicates(entries)).toEqual([]);
  });

  it('detects a single duplicate key', () => {
    const entries = [
      { key: 'FOO', value: 'first' },
      { key: 'FOO', value: 'second' },
    ];
    const result = findDuplicates(entries);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('FOO');
    expect(result[0].keptValue).toBe('second');
    expect(result[0].removedValues).toEqual(['first']);
    expect(result[0].occurrences).toBe(2);
  });

  it('detects multiple duplicates across different keys', () => {
    const entries = [
      { key: 'A', value: '1' },
      { key: 'B', value: 'x' },
      { key: 'A', value: '2' },
      { key: 'B', value: 'y' },
      { key: 'B', value: 'z' },
    ];
    const result = findDuplicates(entries);
    expect(result).toHaveLength(2);
    const a = result.find((d) => d.key === 'A')!;
    expect(a.keptValue).toBe('2');
    const b = result.find((d) => d.key === 'B')!;
    expect(b.keptValue).toBe('z');
    expect(b.removedValues).toEqual(['x', 'y']);
  });
});

describe('dedupeEnv', () => {
  it('returns deduped env with correct totals', () => {
    const entries = [
      { key: 'FOO', value: 'a' },
      { key: 'FOO', value: 'b' },
      { key: 'BAR', value: 'c' },
    ];
    const env = { FOO: 'b', BAR: 'c' };
    const result = dedupeEnv(entries, env);
    expect(result.deduped).toEqual({ FOO: 'b', BAR: 'c' });
    expect(result.totalRemoved).toBe(1);
    expect(result.duplicates).toHaveLength(1);
  });
});

describe('dedupeFormatter', () => {
  it('formatDuplicateEntry formats a single duplicate', () => {
    const entry = { key: 'FOO', occurrences: 2, keptValue: 'b', removedValues: ['a'] };
    const output = formatDuplicateEntry(entry);
    expect(output).toContain('FOO');
    expect(output).toContain('"b"');
    expect(output).toContain('"a"');
  });

  it('formatDedupeResult returns clean message when no duplicates', () => {
    const result = { deduped: {}, duplicates: [], totalRemoved: 0 };
    expect(formatDedupeResult(result)).toBe('No duplicate keys found.');
  });

  it('formatDedupeSummary returns clean message when no duplicates', () => {
    const result = { deduped: {}, duplicates: [], totalRemoved: 0 };
    expect(formatDedupeSummary(result)).toContain('No duplicates found');
  });

  it('formatDedupeSummary reports counts correctly', () => {
    const result = {
      deduped: { FOO: 'b' },
      duplicates: [{ key: 'FOO', occurrences: 2, keptValue: 'b', removedValues: ['a'] }],
      totalRemoved: 1,
    };
    const summary = formatDedupeSummary(result);
    expect(summary).toContain('1 duplicate key');
    expect(summary).toContain('1 redundant entry');
  });
});
