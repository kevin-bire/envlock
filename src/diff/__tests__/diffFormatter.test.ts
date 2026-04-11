import { maskValue, formatEntry, formatDiff } from '../diffFormatter';
import { DiffResult } from '../envDiff';

describe('maskValue', () => {
  it('masks sensitive keys', () => {
    expect(maskValue('DB_PASSWORD', 'secret123')).toBe('****');
    expect(maskValue('API_TOKEN', 'tok_abc')).toBe('****');
    expect(maskValue('AUTH_KEY', 'xyz')).toBe('****');
  });

  it('does not mask non-sensitive keys', () => {
    expect(maskValue('APP_NAME', 'myapp')).toBe('myapp');
    expect(maskValue('PORT', '3000')).toBe('3000');
  });

  it('returns empty string for undefined value', () => {
    expect(maskValue('KEY', undefined)).toBe('');
  });
});

describe('formatEntry', () => {
  it('formats added entry', () => {
    const entry = { key: 'FOO', status: 'added' as const, newValue: 'bar' };
    expect(formatEntry(entry)).toBe('+ FOO=bar');
  });

  it('formats removed entry', () => {
    const entry = { key: 'FOO', status: 'removed' as const, oldValue: 'bar' };
    expect(formatEntry(entry)).toBe('- FOO=bar');
  });

  it('formats changed entry', () => {
    const entry = { key: 'FOO', status: 'changed' as const, oldValue: 'old', newValue: 'new' };
    expect(formatEntry(entry)).toBe('~ FOO: old → new');
  });

  it('formats unchanged entry', () => {
    const entry = { key: 'FOO', status: 'unchanged' as const, oldValue: 'val', newValue: 'val' };
    expect(formatEntry(entry)).toBe('  FOO=val');
  });
});

describe('formatDiff', () => {
  const result: DiffResult = {
    entries: [
      { key: 'A', status: 'added', newValue: '1' },
      { key: 'B', status: 'removed', oldValue: '2' },
      { key: 'C', status: 'unchanged', oldValue: '3', newValue: '3' },
    ],
    added: 1,
    removed: 1,
    changed: 0,
    unchanged: 1,
  };

  it('excludes unchanged by default', () => {
    const output = formatDiff(result);
    expect(output).not.toContain('  C=');
    expect(output).toContain('+ A=1');
  });

  it('includes unchanged when flag is set', () => {
    const output = formatDiff(result, true);
    expect(output).toContain('  C=3');
  });

  it('includes summary line', () => {
    const output = formatDiff(result);
    expect(output).toContain('Summary:');
    expect(output).toContain('+1 added');
  });
});
