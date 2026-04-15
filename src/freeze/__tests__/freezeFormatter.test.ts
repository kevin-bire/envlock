import {
  formatFreezeResult,
  formatFreezeSummary,
  formatDriftEntry,
  formatDriftResult,
  formatDriftSummary,
} from '../freezeFormatter';

describe('formatFreezeResult', () => {
  it('should format frozen keys', () => {
    const result = formatFreezeResult({ frozen: ['API_KEY', 'DB_URL'], skipped: [] });
    expect(result).toContain('API_KEY');
    expect(result).toContain('DB_URL');
    expect(result).toContain('frozen');
  });

  it('should include skipped keys when present', () => {
    const result = formatFreezeResult({ frozen: ['API_KEY'], skipped: ['ALREADY_FROZEN'] });
    expect(result).toContain('ALREADY_FROZEN');
    expect(result).toContain('skipped');
  });

  it('should handle empty frozen list', () => {
    const result = formatFreezeResult({ frozen: [], skipped: [] });
    expect(result).toContain('No keys frozen');
  });
});

describe('formatFreezeSummary', () => {
  it('should show counts', () => {
    const result = formatFreezeSummary({ frozen: ['A', 'B'], skipped: ['C'] });
    expect(result).toContain('2');
    expect(result).toContain('1');
  });
});

describe('formatDriftEntry', () => {
  it('should show key, expected, and actual values', () => {
    const entry = formatDriftEntry({ key: 'API_KEY', expected: 'abc', actual: 'xyz' });
    expect(entry).toContain('API_KEY');
    expect(entry).toContain('abc');
    expect(entry).toContain('xyz');
  });

  it('should mask sensitive values', () => {
    const entry = formatDriftEntry({ key: 'SECRET_TOKEN', expected: 'old_secret', actual: 'new_secret', masked: true });
    expect(entry).toContain('SECRET_TOKEN');
    expect(entry).not.toContain('old_secret');
    expect(entry).not.toContain('new_secret');
    expect(entry).toContain('***');
  });
});

describe('formatDriftResult', () => {
  it('should list all drifted keys', () => {
    const drifts = [
      { key: 'API_KEY', expected: 'old', actual: 'new', masked: false },
      { key: 'DB_HOST', expected: 'localhost', actual: '10.0.0.1', masked: false },
    ];
    const result = formatDriftResult(drifts);
    expect(result).toContain('API_KEY');
    expect(result).toContain('DB_HOST');
  });

  it('should show clean message when no drift', () => {
    const result = formatDriftResult([]);
    expect(result).toContain('No drift detected');
  });
});

describe('formatDriftSummary', () => {
  it('should show drift count', () => {
    const drifts = [
      { key: 'A', expected: '1', actual: '2', masked: false },
    ];
    const result = formatDriftSummary(drifts);
    expect(result).toContain('1');
    expect(result).toMatch(/drift/i);
  });
});
