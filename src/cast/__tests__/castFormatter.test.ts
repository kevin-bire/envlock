import { formatCastError, formatCastResult, formatCastSummary } from '../castFormatter';
import type { CastResult, CastError } from '../envCast';

const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, '');

const mockError: CastError = {
  key: 'PORT',
  value: 'abc',
  expectedType: 'number',
  message: 'Cannot cast "abc" to number',
};

const successResult: CastResult = {
  casted: { PORT: 3000, DEBUG: true },
  errors: [],
};

const errorResult: CastResult = {
  casted: { PORT: 'abc', DEBUG: true },
  errors: [mockError],
};

describe('formatCastError', () => {
  it('includes key and message', () => {
    const output = stripAnsi(formatCastError(mockError));
    expect(output).toContain('PORT');
    expect(output).toContain('Cannot cast "abc" to number');
  });
});

describe('formatCastResult', () => {
  it('shows success message when no errors', () => {
    const output = stripAnsi(formatCastResult(successResult));
    expect(output).toContain('All values cast successfully');
  });

  it('shows errors when present', () => {
    const output = stripAnsi(formatCastResult(errorResult));
    expect(output).toContain('Cast completed with errors');
    expect(output).toContain('PORT');
  });
});

describe('formatCastSummary', () => {
  it('shows total, succeeded, and no failed line on success', () => {
    const output = stripAnsi(formatCastSummary(successResult));
    expect(output).toContain('Cast Summary');
    expect(output).toContain('Total fields : 2');
    expect(output).toContain('Succeeded    : 2');
    expect(output).not.toContain('Failed');
  });

  it('shows failed count when errors exist', () => {
    const output = stripAnsi(formatCastSummary(errorResult));
    expect(output).toContain('Failed       : 1');
    expect(output).toContain('Succeeded    : 1');
  });
});
