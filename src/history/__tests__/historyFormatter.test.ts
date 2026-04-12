import {
  formatHistoryEntry,
  formatHistoryResult,
  formatHistorySummary,
  formatHistoryDiff,
} from '../historyFormatter';
import type { HistoryEntry } from '../envHistory';

const makeEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  timestamp: '2024-01-01T00:00:00.000Z',
  file: '.env',
  checksum: 'abc123',
  keys: ['FOO', 'BAR'],
  snapshot: { FOO: 'foo', BAR: 'bar' },
  ...overrides,
});

describe('formatHistoryEntry', () => {
  it('includes timestamp and checksum', () => {
    const result = formatHistoryEntry(makeEntry(), 0);
    expect(result).toContain('2024-01-01T00:00:00.000Z');
    expect(result).toContain('abc123');
  });

  it('shows key count', () => {
    const result = formatHistoryEntry(makeEntry(), 0);
    expect(result).toContain('2');
  });

  it('truncates keys beyond 5', () => {
    const entry = makeEntry({ keys: ['A','B','C','D','E','F','G'] });
    const result = formatHistoryEntry(entry, 0);
    expect(result).toContain('...');
  });
});

describe('formatHistoryResult', () => {
  it('returns message when no entries', () => {
    expect(formatHistoryResult([])).toContain('No history');
  });

  it('formats multiple entries', () => {
    const entries = [makeEntry(), makeEntry({ checksum: 'def456' })];
    const result = formatHistoryResult(entries);
    expect(result).toContain('abc123');
    expect(result).toContain('def456');
  });
});

describe('formatHistorySummary', () => {
  it('handles empty entries', () => {
    const result = formatHistorySummary([]);
    expect(result).toContain('0');
  });

  it('shows unique states count', () => {
    const entries = [makeEntry(), makeEntry(), makeEntry({ checksum: 'xyz' })];
    const result = formatHistorySummary(entries);
    expect(result).toContain('2');
  });
});

describe('formatHistoryDiff', () => {
  it('shows added keys', () => {
    const a = makeEntry({ keys: ['FOO'], snapshot: { FOO: '1' } });
    const b = makeEntry({ keys: ['FOO', 'BAR'], snapshot: { FOO: '1', BAR: '2' } });
    const result = formatHistoryDiff(a, b);
    expect(result).toContain('BAR');
    expect(result).toContain('Added');
  });

  it('shows removed keys', () => {
    const a = makeEntry({ keys: ['FOO', 'BAR'], snapshot: { FOO: '1', BAR: '2' } });
    const b = makeEntry({ keys: ['FOO'], snapshot: { FOO: '1' } });
    const result = formatHistoryDiff(a, b);
    expect(result).toContain('Removed');
  });

  it('shows no differences when identical', () => {
    const a = makeEntry();
    const b = makeEntry();
    const result = formatHistoryDiff(a, b);
    expect(result).toContain('No differences');
  });

  it('shows changed keys', () => {
    const a = makeEntry({ snapshot: { FOO: 'old', BAR: 'bar' } });
    const b = makeEntry({ snapshot: { FOO: 'new', BAR: 'bar' } });
    const result = formatHistoryDiff(a, b);
    expect(result).toContain('Changed');
    expect(result).toContain('FOO');
  });
});
