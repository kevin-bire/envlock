import {
  formatPinEntry,
  formatPinResult,
  formatPinSummary,
  PinEntry,
  PinResult,
} from '../pinFormatter';

const matchedEntry: PinEntry = {
  key: 'API_KEY',
  pinnedValue: 'abc123',
  currentValue: 'abc123',
  matched: true,
};

const violatedEntry: PinEntry = {
  key: 'SECRET',
  pinnedValue: 'old-secret',
  currentValue: 'new-secret',
  matched: false,
};

const missingEntry: PinEntry = {
  key: 'MISSING_KEY',
  pinnedValue: 'val',
  currentValue: undefined,
  matched: false,
};

describe('formatPinEntry', () => {
  it('formats a matched entry with checkmark', () => {
    const result = formatPinEntry(matchedEntry);
    expect(result).toContain('✔');
    expect(result).toContain('API_KEY');
    expect(result).toContain('abc123');
  });

  it('formats a violated entry with cross', () => {
    const result = formatPinEntry(violatedEntry);
    expect(result).toContain('✘');
    expect(result).toContain('SECRET');
    expect(result).toContain('old-secret');
    expect(result).toContain('new-secret');
  });

  it('shows (missing) when currentValue is undefined', () => {
    const result = formatPinEntry(missingEntry);
    expect(result).toContain('(missing)');
  });
});

describe('formatPinResult', () => {
  it('includes pinned keys section', () => {
    const result: PinResult = {
      pinned: ['KEY_A', 'KEY_B'],
      unpinned: [],
      violations: [],
      checked: [],
    };
    const output = formatPinResult(result);
    expect(output).toContain('Pinned keys (2)');
    expect(output).toContain('+ KEY_A');
    expect(output).toContain('+ KEY_B');
  });

  it('includes unpinned keys section', () => {
    const result: PinResult = {
      pinned: [],
      unpinned: ['OLD_KEY'],
      violations: [],
      checked: [],
    };
    const output = formatPinResult(result);
    expect(output).toContain('Unpinned keys (1)');
    expect(output).toContain('- OLD_KEY');
  });

  it('includes checked pins section', () => {
    const result: PinResult = {
      pinned: [],
      unpinned: [],
      violations: [violatedEntry],
      checked: [matchedEntry, violatedEntry],
    };
    const output = formatPinResult(result);
    expect(output).toContain('Checked pins (2)');
    expect(output).toContain('API_KEY');
    expect(output).toContain('SECRET');
  });
});

describe('formatPinSummary', () => {
  it('returns "no changes" when result is empty', () => {
    const result: PinResult = { pinned: [], unpinned: [], violations: [], checked: [] };
    expect(formatPinSummary(result)).toBe('no changes');
  });

  it('reports violations', () => {
    const result: PinResult = {
      pinned: [],
      unpinned: [],
      violations: [violatedEntry],
      checked: [violatedEntry],
    };
    expect(formatPinSummary(result)).toContain('1 violation(s)');
  });

  it('reports all pins valid when checked but no violations', () => {
    const result: PinResult = {
      pinned: [],
      unpinned: [],
      violations: [],
      checked: [matchedEntry],
    };
    expect(formatPinSummary(result)).toContain('all pins valid');
  });

  it('combines multiple parts', () => {
    const result: PinResult = {
      pinned: ['A'],
      unpinned: ['B'],
      violations: [],
      checked: [],
    };
    const summary = formatPinSummary(result);
    expect(summary).toContain('1 pinned');
    expect(summary).toContain('1 unpinned');
  });
});
