import {
  formatDuplicateValueEntry,
  formatUniqueResult,
  formatUniqueSummary,
  UniqueResult,
} from '../uniqueFormatter';

const baseResult: UniqueResult = {
  original: { A: 'hello', B: 'hello', C: 'world' },
  unique: { A: 'hello', C: 'world' },
  duplicateValues: { hello: ['A', 'B'] },
};

describe('formatDuplicateValueEntry', () => {
  it('formats a duplicate value entry', () => {
    const out = formatDuplicateValueEntry('hello', ['A', 'B']);
    expect(out).toContain('hello');
    expect(out).toContain('A');
    expect(out).toContain('B');
  });
});

describe('formatUniqueResult', () => {
  it('shows warning when duplicates exist', () => {
    const out = formatUniqueResult(baseResult);
    expect(out).toContain('⚠');
    expect(out).toContain('1 duplicate value');
    expect(out).toContain('hello');
  });

  it('shows success when no duplicates', () => {
    const clean: UniqueResult = {
      original: { A: 'foo', B: 'bar' },
      unique: { A: 'foo', B: 'bar' },
      duplicateValues: {},
    };
    const out = formatUniqueResult(clean);
    expect(out).toContain('✔');
    expect(out).toContain('No duplicate');
  });

  it('shows unique entries in verbose mode', () => {
    const out = formatUniqueResult(baseResult, true);
    expect(out).toContain('Unique entries:');
    expect(out).toContain('A=hello');
    expect(out).toContain('C=world');
  });

  it('does not show entries without verbose mode', () => {
    const out = formatUniqueResult(baseResult, false);
    expect(out).not.toContain('Unique entries:');
  });
});

describe('formatUniqueSummary', () => {
  it('reports correct counts', () => {
    const out = formatUniqueSummary(baseResult);
    expect(out).toContain('Total keys   : 3');
    expect(out).toContain('Unique kept  : 2');
    expect(out).toContain('Removed dupes: 1');
  });

  it('reports zero removed when no duplicates', () => {
    const clean: UniqueResult = {
      original: { X: '1', Y: '2' },
      unique: { X: '1', Y: '2' },
      duplicateValues: {},
    };
    const out = formatUniqueSummary(clean);
    expect(out).toContain('Removed dupes: 0');
  });
});
