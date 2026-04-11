import { formatTrimChange, formatTrimResult, formatTrimSummary } from '../trimFormatter';
import { TrimChange, TrimResult } from '../envTrim';

const makeResult = (changes: TrimChange[]): TrimResult => ({
  trimmed: {},
  changes,
  totalTrimmed: changes.length,
});

describe('formatTrimChange', () => {
  it('formats a trailing change', () => {
    const change: TrimChange = { key: 'FOO', before: 'bar   ', after: 'bar', type: 'trailing' };
    const output = formatTrimChange(change);
    expect(output).toContain('FOO');
    expect(output).toContain('trailing whitespace');
    expect(output).toContain('bar   ');
    expect(output).toContain('bar');
  });

  it('formats a quotes change', () => {
    const change: TrimChange = { key: 'API_KEY', before: '"secret"', after: 'secret', type: 'quotes' };
    const output = formatTrimChange(change);
    expect(output).toContain('quotes');
    expect(output).toContain('API_KEY');
  });
});

describe('formatTrimResult', () => {
  it('returns clean message when no changes', () => {
    const result = makeResult([]);
    expect(formatTrimResult(result)).toBe('No values required trimming.');
  });

  it('lists all changes when present', () => {
    const changes: TrimChange[] = [
      { key: 'A', before: ' a ', after: 'a', type: 'both' },
      { key: 'B', before: 'b  ', after: 'b', type: 'trailing' },
    ];
    const output = formatTrimResult(makeResult(changes));
    expect(output).toContain('Trimmed values:');
    expect(output).toContain('A');
    expect(output).toContain('B');
  });
});

describe('formatTrimSummary', () => {
  it('shows checkmark when nothing trimmed', () => {
    expect(formatTrimSummary(makeResult([]))).toContain('✔');
  });

  it('shows count for single trim', () => {
    const changes: TrimChange[] = [{ key: 'X', before: ' x', after: 'x', type: 'leading' }];
    const summary = formatTrimSummary(makeResult(changes));
    expect(summary).toContain('1 value trimmed');
  });

  it('shows plural count for multiple trims', () => {
    const changes: TrimChange[] = [
      { key: 'X', before: ' x', after: 'x', type: 'leading' },
      { key: 'Y', before: 'y ', after: 'y', type: 'trailing' },
    ];
    const summary = formatTrimSummary(makeResult(changes));
    expect(summary).toContain('2 values trimmed');
  });
});
