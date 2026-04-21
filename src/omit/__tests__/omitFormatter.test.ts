import {
  formatOmittedEntry,
  formatSkippedEntry,
  formatOmitResult,
  formatOmitSummary,
  OmitResult,
} from '../omitFormatter';

const baseResult: OmitResult = {
  original: { A: '1', B: '2', C: '3', D: '4' },
  result: { C: '3', D: '4' },
  omitted: ['A', 'B'],
  skipped: [],
};

describe('formatOmittedEntry', () => {
  it('formats an omitted key entry', () => {
    expect(formatOmittedEntry('SECRET_KEY')).toBe('  - SECRET_KEY (omitted)');
  });
});

describe('formatSkippedEntry', () => {
  it('formats a skipped key entry', () => {
    expect(formatSkippedEntry('MISSING_KEY')).toBe('  ~ MISSING_KEY (not found, skipped)');
  });
});

describe('formatOmitResult', () => {
  it('lists omitted keys', () => {
    const output = formatOmitResult(baseResult);
    expect(output).toContain('Omitted keys:');
    expect(output).toContain('  - A (omitted)');
    expect(output).toContain('  - B (omitted)');
  });

  it('lists skipped keys when present', () => {
    const result: OmitResult = { ...baseResult, skipped: ['Z'] };
    const output = formatOmitResult(result);
    expect(output).toContain('Skipped (not found):');
    expect(output).toContain('  ~ Z (not found, skipped)');
  });

  it('shows no-op message when nothing was omitted or skipped', () => {
    const result: OmitResult = {
      original: { A: '1' },
      result: { A: '1' },
      omitted: [],
      skipped: [],
    };
    expect(formatOmitResult(result)).toBe('No keys omitted.');
  });

  it('does not include skipped section when skipped is empty', () => {
    const output = formatOmitResult(baseResult);
    expect(output).not.toContain('Skipped (not found):');
  });
});

describe('formatOmitSummary', () => {
  it('returns correct counts', () => {
    const output = formatOmitSummary(baseResult);
    expect(output).toContain('Total keys: 4');
    expect(output).toContain('Omitted:    2');
    expect(output).toContain('Skipped:    0');
    expect(output).toContain('Remaining:  2');
  });

  it('reflects skipped count accurately', () => {
    const result: OmitResult = {
      original: { A: '1', B: '2' },
      result: { A: '1', B: '2' },
      omitted: [],
      skipped: ['X', 'Y'],
    };
    const output = formatOmitSummary(result);
    expect(output).toContain('Skipped:    2');
    expect(output).toContain('Omitted:    0');
  });
});
