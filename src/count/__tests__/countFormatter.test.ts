import {
  formatPrefixRow,
  formatCountResult,
  formatCountSummary,
  CountResult,
} from '../countFormatter';

describe('formatPrefixRow', () => {
  it('formats a prefix row with percentage', () => {
    const row = formatPrefixRow('DB', 3, 10);
    expect(row).toContain('DB');
    expect(row).toContain('3');
    expect(row).toContain('30.0%');
  });

  it('handles zero total gracefully', () => {
    const row = formatPrefixRow('APP', 0, 0);
    expect(row).toContain('0.0%');
  });
});

describe('formatCountResult', () => {
  const result: CountResult = {
    total: 5,
    byPrefix: { DB: 2, APP: 2 },
    unprefixed: 1,
  };

  it('includes total key count', () => {
    const output = formatCountResult(result);
    expect(output).toContain('Total keys: 5');
  });

  it('lists each prefix', () => {
    const output = formatCountResult(result);
    expect(output).toContain('APP');
    expect(output).toContain('DB');
  });

  it('shows unprefixed keys', () => {
    const output = formatCountResult(result);
    expect(output).toContain('(no prefix)');
  });

  it('omits unprefixed section when none exist', () => {
    const noUnprefixed: CountResult = { total: 4, byPrefix: { DB: 4 }, unprefixed: 0 };
    const output = formatCountResult(noUnprefixed);
    expect(output).not.toContain('(no prefix)');
  });
});

describe('formatCountSummary', () => {
  it('returns a summary with prefix group count', () => {
    const result: CountResult = { total: 6, byPrefix: { A: 3, B: 3 }, unprefixed: 0 };
    const summary = formatCountSummary(result);
    expect(summary).toContain('6 key(s)');
    expect(summary).toContain('2 prefix group(s)');
  });

  it('mentions unprefixed keys when present', () => {
    const result: CountResult = { total: 4, byPrefix: { A: 3 }, unprefixed: 1 };
    const summary = formatCountSummary(result);
    expect(summary).toContain('1 key(s) have no prefix');
  });

  it('omits unprefixed mention when zero', () => {
    const result: CountResult = { total: 3, byPrefix: { A: 3 }, unprefixed: 0 };
    const summary = formatCountSummary(result);
    expect(summary).not.toContain('no prefix');
  });
});
