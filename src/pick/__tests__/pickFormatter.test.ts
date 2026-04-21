import { formatPickedEntry, formatPickResult, formatPickSummary } from '../pickFormatter';
import { PickResult } from '../envPick';

describe('formatPickedEntry', () => {
  it('formats key=value', () => {
    expect(formatPickedEntry('DB_HOST', 'localhost')).toBe('  DB_HOST=localhost');
  });

  it('masks value when mask=true', () => {
    expect(formatPickedEntry('API_KEY', 'secret', true)).toBe('  API_KEY=****');
  });
});

describe('formatPickResult', () => {
  it('shows picked entries', () => {
    const result: PickResult = {
      picked: { DB_HOST: 'localhost', DB_PORT: '5432' },
      missing: [],
      total: 2,
    };
    const output = formatPickResult(result);
    expect(output).toContain('Picked entries:');
    expect(output).toContain('DB_HOST=localhost');
    expect(output).toContain('DB_PORT=5432');
    expect(output).not.toContain('Missing keys:');
  });

  it('shows (none) when no entries picked', () => {
    const result: PickResult = { picked: {}, missing: ['FOO'], total: 0 };
    const output = formatPickResult(result);
    expect(output).toContain('(none)');
    expect(output).toContain('Missing keys:');
    expect(output).toContain('- FOO');
  });

  it('masks values when mask=true', () => {
    const result: PickResult = {
      picked: { SECRET: 'topsecret' },
      missing: [],
      total: 1,
    };
    const output = formatPickResult(result, true);
    expect(output).toContain('SECRET=****');
    expect(output).not.toContain('topsecret');
  });
});

describe('formatPickSummary', () => {
  it('returns summary string', () => {
    const result: PickResult = { picked: { A: '1' }, missing: ['B'], total: 1 };
    const summary = formatPickSummary(result);
    expect(summary).toBe('Picked: 1 | Missing: 1');
  });

  it('handles zero missing', () => {
    const result: PickResult = { picked: { A: '1', B: '2' }, missing: [], total: 2 };
    const summary = formatPickSummary(result);
    expect(summary).toBe('Picked: 2 | Missing: 0');
  });
});
