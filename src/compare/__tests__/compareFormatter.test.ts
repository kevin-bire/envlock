import { compareEnvs } from '../envCompare';
import { formatCompareEntry, formatCompareResult, maskCompareValue } from '../compareFormatter';

describe('maskCompareValue', () => {
  it('returns (none) for undefined', () => {
    expect(maskCompareValue(undefined, false)).toBe('(none)');
  });

  it('returns masked asterisks when masked=true', () => {
    const result = maskCompareValue('secret123', true);
    expect(result).toMatch(/^\*+$/);
  });

  it('returns plain value when masked=false', () => {
    expect(maskCompareValue('hello', false)).toBe('hello');
  });
});

describe('formatCompareEntry', () => {
  it('formats a match entry', () => {
    const entry = { key: 'APP', status: 'match' as const, sourceValue: 'val', targetValue: 'val' };
    const output = formatCompareEntry(entry);
    expect(output).toContain('MATCH');
    expect(output).toContain('APP');
  });

  it('formats a mismatch entry with both values', () => {
    const entry = { key: 'DB', status: 'mismatch' as const, sourceValue: 'local', targetValue: 'prod' };
    const output = formatCompareEntry(entry);
    expect(output).toContain('MISMATCH');
    expect(output).toContain('local');
    expect(output).toContain('prod');
  });

  it('masks values when masked=true', () => {
    const entry = { key: 'SECRET', status: 'mismatch' as const, sourceValue: 'abc', targetValue: 'xyz' };
    const output = formatCompareEntry(entry, true);
    expect(output).not.toContain('abc');
    expect(output).not.toContain('xyz');
  });

  it('formats missing_in_target entry', () => {
    const entry = { key: 'KEY', status: 'missing_in_target' as const, sourceValue: 'v' };
    expect(formatCompareEntry(entry)).toContain('MISSING IN TARGET');
  });

  it('formats missing_in_source entry', () => {
    const entry = { key: 'KEY', status: 'missing_in_source' as const, targetValue: 'v' };
    expect(formatCompareEntry(entry)).toContain('MISSING IN SOURCE');
  });
});

describe('formatCompareResult', () => {
  it('includes summary counts', () => {
    const result = compareEnvs({ A: '1', B: '2' }, { A: '1', C: '3' });
    const output = formatCompareResult(result);
    expect(output).toContain('Total keys');
    expect(output).toContain('Matches');
    expect(output).toContain('Mismatches');
  });

  it('renders full comparison output', () => {
    const result = compareEnvs({ X: 'foo' }, { X: 'bar' });
    const output = formatCompareResult(result);
    expect(output).toContain('Environment Comparison');
    expect(output).toContain('X');
  });
});
