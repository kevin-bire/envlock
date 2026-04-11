import {
  formatResolvedEntry,
  formatConflicts,
  formatResolveResult,
  formatResolveSummary,
} from '../resolveFormatter';
import type { ResolveResult } from '../envResolve';

const makeResult = (overrides: Partial<ResolveResult> = {}): ResolveResult => ({
  resolved: { KEY1: 'secret', KEY2: '' },
  sources: { KEY1: 'file', KEY2: 'override' },
  missing: ['KEY2'],
  conflicts: [],
  ...overrides,
});

describe('formatResolvedEntry', () => {
  it('masks value by default', () => {
    const out = formatResolvedEntry('KEY1', 'secret', 'file');
    expect(out).toContain('****');
    expect(out).toContain('[file]');
  });

  it('shows value when masking disabled', () => {
    const out = formatResolvedEntry('KEY1', 'secret', 'file', false);
    expect(out).toContain('secret');
  });

  it('shows (empty) for blank value', () => {
    const out = formatResolvedEntry('KEY2', '', 'override', false);
    expect(out).toContain('(empty)');
  });
});

describe('formatConflicts', () => {
  it('returns empty string when no conflicts', () => {
    expect(formatConflicts([])).toBe('');
  });

  it('formats conflict entries', () => {
    const out = formatConflicts([
      { key: 'KEY1', fileValue: 'old', overrideValue: 'new' },
    ]);
    expect(out).toContain('KEY1');
    expect(out).toContain('old');
    expect(out).toContain('new');
  });
});

describe('formatResolveResult', () => {
  it('includes header and entries', () => {
    const out = formatResolveResult(makeResult());
    expect(out).toContain('Resolved environment:');
    expect(out).toContain('KEY1');
    expect(out).toContain('KEY2');
  });
});

describe('formatResolveSummary', () => {
  it('includes totals and counts', () => {
    const result = makeResult({
      sources: { KEY1: 'file', KEY2: 'override', KEY3: 'process' },
      resolved: { KEY1: 'a', KEY2: 'b', KEY3: 'c' },
      conflicts: [{ key: 'KEY2', fileValue: 'old', overrideValue: 'b' }],
    });
    const out = formatResolveSummary(result);
    expect(out).toContain('Total: 3');
    expect(out).toContain('Overrides: 1');
    expect(out).toContain('From process: 1');
    expect(out).toContain('Conflicts: 1');
  });
});
