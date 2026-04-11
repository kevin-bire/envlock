import { formatScopeResult, formatScopeSummary } from '../scopeFormatter';
import { ScopeResult } from '../envScope';

const sampleResult: ScopeResult = {
  scoped: { APP__HOST: 'localhost', APP__PORT: '3000' },
  unscoped: { DB__HOST: 'db.local', GLOBAL: 'val' },
  matched: ['APP__HOST', 'APP__PORT'],
  unmatched: ['DB__HOST', 'GLOBAL'],
};

describe('formatScopeResult', () => {
  it('includes scope names in header', () => {
    const output = formatScopeResult(sampleResult, ['APP']);
    expect(output).toContain('APP');
  });

  it('lists matched keys with checkmark', () => {
    const output = formatScopeResult(sampleResult, ['APP']);
    expect(output).toContain('✔ APP__HOST');
    expect(output).toContain('✔ APP__PORT');
  });

  it('lists unmatched keys with dash', () => {
    const output = formatScopeResult(sampleResult, ['APP']);
    expect(output).toContain('- DB__HOST');
    expect(output).toContain('- GLOBAL');
  });

  it('shows message when no keys matched', () => {
    const empty: ScopeResult = {
      scoped: {},
      unscoped: { KEY: 'val' },
      matched: [],
      unmatched: ['KEY'],
    };
    const output = formatScopeResult(empty, ['UNKNOWN']);
    expect(output).toContain('No keys matched');
  });

  it('shows matched count', () => {
    const output = formatScopeResult(sampleResult, ['APP']);
    expect(output).toContain('Matched keys (2)');
  });
});

describe('formatScopeSummary', () => {
  it('includes total, matched, and unmatched counts', () => {
    const summary = formatScopeSummary(sampleResult, ['APP']);
    expect(summary).toContain('Total: 4');
    expect(summary).toContain('Matched: 2');
    expect(summary).toContain('Unmatched: 2');
  });

  it('includes scope names', () => {
    const summary = formatScopeSummary(sampleResult, ['APP', 'DB']);
    expect(summary).toContain('APP, DB');
  });
});
