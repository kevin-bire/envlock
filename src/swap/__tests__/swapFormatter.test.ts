import { formatSwapOperation, formatSkippedOperation, formatSwapResult, formatSwapSummary } from '../swapFormatter';
import { SwapResult } from '../envSwap';

const baseResult: SwapResult = {
  output: { DB_HOST: 'localhost', DB_PORT: '5432' },
  swapped: [{ keyA: 'DB_HOST', keyB: 'DB_PORT' }],
  skipped: [],
  totalSwaps: 1,
};

describe('formatSwapOperation', () => {
  it('formats a values swap operation', () => {
    const out = formatSwapOperation({ keyA: 'A', keyB: 'B' }, 'values');
    expect(out).toContain('A <-> B');
    expect(out).toContain('values');
  });

  it('formats a keys swap operation', () => {
    const out = formatSwapOperation({ keyA: 'X', keyB: 'Y' }, 'keys');
    expect(out).toContain('keys');
    expect(out).toContain('X <-> Y');
  });
});

describe('formatSkippedOperation', () => {
  it('formats a skipped operation', () => {
    const out = formatSkippedOperation({ keyA: 'A', keyB: 'MISSING' });
    expect(out).toContain('A <-> MISSING');
    expect(out).toContain('skipped');
  });
});

describe('formatSwapResult', () => {
  it('includes swapped entries', () => {
    const out = formatSwapResult(baseResult, 'values');
    expect(out).toContain('DB_HOST <-> DB_PORT');
    expect(out).toContain('Swapped');
  });

  it('includes skipped entries when present', () => {
    const result: SwapResult = {
      ...baseResult,
      skipped: [{ keyA: 'A', keyB: 'MISSING' }],
    };
    const out = formatSwapResult(result, 'keys');
    expect(out).toContain('Skipped');
    expect(out).toContain('A <-> MISSING');
  });

  it('returns empty string when no swaps or skips', () => {
    const result: SwapResult = { output: {}, swapped: [], skipped: [], totalSwaps: 0 };
    const out = formatSwapResult(result, 'values');
    expect(out).toBe('');
  });
});

describe('formatSwapSummary', () => {
  it('formats a summary with counts', () => {
    const out = formatSwapSummary(baseResult, 'values');
    expect(out).toContain('Swapped : 1');
    expect(out).toContain('Skipped : 0');
    expect(out).toContain('values');
  });

  it('reflects skipped count in summary', () => {
    const result: SwapResult = {
      ...baseResult,
      skipped: [{ keyA: 'A', keyB: 'B' }],
    };
    const out = formatSwapSummary(result, 'keys');
    expect(out).toContain('Skipped : 1');
  });
});
