import {
  formatUnresolved,
  formatCycles,
  formatInterpolateResult,
  formatInterpolateSummary,
} from '../interpolateFormatter';
import { InterpolateResult } from '../envInterpolate';

const cleanResult: InterpolateResult = {
  interpolated: { HOST: 'localhost', PORT: '3000' },
  unresolved: [],
  cycles: [],
};

const dirtyResult: InterpolateResult = {
  interpolated: { HOST: 'localhost', URL: '${MISSING}', LOOP: '${LOOP}' },
  unresolved: ['MISSING'],
  cycles: ['LOOP'],
};

describe('formatUnresolved', () => {
  it('returns empty string when no unresolved keys', () => {
    expect(formatUnresolved([])).toBe('');
  });

  it('lists unresolved variable names', () => {
    const output = formatUnresolved(['MISSING_KEY']);
    expect(output).toContain('MISSING_KEY');
    expect(output).toContain('Unresolved');
  });
});

describe('formatCycles', () => {
  it('returns empty string when no cycles', () => {
    expect(formatCycles([])).toBe('');
  });

  it('lists cyclic variable names', () => {
    const output = formatCycles(['LOOP_VAR']);
    expect(output).toContain('LOOP_VAR');
    expect(output).toContain('Cyclic');
  });
});

describe('formatInterpolateResult', () => {
  it('shows success status when no issues', () => {
    const output = formatInterpolateResult(cleanResult);
    expect(output).toContain('✔ All variables resolved');
    expect(output).toContain('Total keys : 2');
  });

  it('shows issue count when problems exist', () => {
    const output = formatInterpolateResult(dirtyResult);
    expect(output).toContain('✖');
    expect(output).toContain('MISSING');
    expect(output).toContain('LOOP');
  });
});

describe('formatInterpolateSummary', () => {
  it('returns success message for clean result', () => {
    const output = formatInterpolateSummary(cleanResult);
    expect(output).toContain('✔');
    expect(output).toContain('2 variable(s) successfully');
  });

  it('returns issue summary for dirty result', () => {
    const output = formatInterpolateSummary(dirtyResult);
    expect(output).toContain('✖');
    expect(output).toContain('unresolved');
    expect(output).toContain('cyclic');
  });
});
