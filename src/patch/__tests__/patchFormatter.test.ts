import { formatOperation, formatPatchResult, formatPatchSummary } from '../patchFormatter';
import { PatchResult } from '../envPatch';

describe('formatOperation', () => {
  it('formats applied set operation', () => {
    const output = formatOperation({ op: 'set', key: 'PORT', value: '8080' }, 'applied');
    expect(output).toContain('SET PORT=8080');
    expect(output).toContain('✔');
  });

  it('formats skipped delete operation', () => {
    const output = formatOperation({ op: 'delete', key: 'OLD' }, 'skipped');
    expect(output).toContain('DELETE OLD');
    expect(output).toContain('✘');
  });

  it('formats applied rename operation', () => {
    const output = formatOperation({ op: 'rename', key: 'A', newKey: 'B' }, 'applied');
    expect(output).toContain('RENAME A');
    expect(output).toContain('B');
  });
});

describe('formatPatchResult', () => {
  const result: PatchResult = {
    original: { PORT: '3000' },
    patched: { PORT: '8080' },
    applied: [{ op: 'set', key: 'PORT', value: '8080' }],
    skipped: [{ op: 'delete', key: 'MISSING' }],
  };

  it('includes applied section', () => {
    const output = formatPatchResult(result);
    expect(output).toContain('Applied operations');
  });

  it('includes skipped section', () => {
    const output = formatPatchResult(result);
    expect(output).toContain('Skipped operations');
  });

  it('returns empty string for no operations', () => {
    const empty: PatchResult = { original: {}, patched: {}, applied: [], skipped: [] };
    expect(formatPatchResult(empty)).toBe('');
  });
});

describe('formatPatchSummary', () => {
  it('shows counts of applied and skipped', () => {
    const result: PatchResult = {
      original: {},
      patched: {},
      applied: [{ op: 'set', key: 'X', value: '1' }],
      skipped: [{ op: 'delete', key: 'Y' }, { op: 'delete', key: 'Z' }],
    };
    const output = formatPatchSummary(result);
    expect(output).toContain('1 applied');
    expect(output).toContain('2 skipped');
    expect(output).toContain('3 total');
  });
});
