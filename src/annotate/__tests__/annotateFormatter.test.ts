import { formatAnnotationEntry, formatAnnotateResult, formatAnnotateSummary } from '../annotateFormatter';
import { AnnotateResult } from '../envAnnotate';

describe('formatAnnotationEntry', () => {
  it('formats a single annotation entry', () => {
    const output = formatAnnotationEntry({ key: 'DB_HOST', comment: 'Database hostname' });
    expect(output).toContain('DB_HOST');
    expect(output).toContain('Database hostname');
    expect(output).toContain('#');
  });
});

describe('formatAnnotateResult', () => {
  it('shows annotated keys', () => {
    const result: AnnotateResult = {
      annotated: { DB_HOST: 'Database hostname' },
      annotations: [{ key: 'DB_HOST', comment: 'Database hostname' }],
      skipped: [],
    };
    const output = formatAnnotateResult(result);
    expect(output).toContain('Annotated keys:');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('Database hostname');
  });

  it('shows skipped keys', () => {
    const result: AnnotateResult = {
      annotated: {},
      annotations: [],
      skipped: ['MISSING_KEY'],
    };
    const output = formatAnnotateResult(result);
    expect(output).toContain('Skipped');
    expect(output).toContain('MISSING_KEY');
  });

  it('shows no annotations message when empty', () => {
    const result: AnnotateResult = {
      annotated: {},
      annotations: [],
      skipped: [],
    };
    const output = formatAnnotateResult(result);
    expect(output).toContain('No keys were annotated.');
  });
});

describe('formatAnnotateSummary', () => {
  it('includes annotated and skipped counts', () => {
    const result: AnnotateResult = {
      annotated: { A: 'note' },
      annotations: [{ key: 'A', comment: 'note' }],
      skipped: ['B', 'C'],
    };
    const output = formatAnnotateSummary(result);
    expect(output).toContain('Annotated: 1');
    expect(output).toContain('Skipped: 2');
  });
});
