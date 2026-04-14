import {
  formatAppliedEntry,
  formatMissingEntry,
  formatConflictEntry,
  formatAliasResult,
  formatAliasSummary,
} from '../aliasFormatter';
import { AliasResult } from '../envAlias';

describe('formatAppliedEntry', () => {
  it('masks the value and shows alias and original', () => {
    const out = formatAppliedEntry('DB_URL', 'DATABASE_URL', 'postgres://host');
    expect(out).toContain('DB_URL');
    expect(out).toContain('DATABASE_URL');
    expect(out).not.toContain('postgres://host');
    expect(out).toContain('*');
  });

  it('shows (empty) for empty values', () => {
    const out = formatAppliedEntry('ALIAS', 'ORIGINAL', '');
    expect(out).toContain('(empty)');
  });
});

describe('formatMissingEntry', () => {
  it('includes the missing key name', () => {
    const out = formatMissingEntry('NONEXISTENT_KEY');
    expect(out).toContain('NONEXISTENT_KEY');
    expect(out).toContain('not found');
  });
});

describe('formatConflictEntry', () => {
  it('includes the conflicting alias name', () => {
    const out = formatConflictEntry('PORT');
    expect(out).toContain('PORT');
    expect(out).toContain('skipped');
  });
});

describe('formatAliasResult', () => {
  const result: AliasResult = {
    output: {},
    applied: [{ alias: 'DB', original: 'DATABASE_URL', value: 'postgres://x' }],
    missing: ['MISSING_KEY'],
    conflicts: ['PORT'],
  };

  it('includes applied section', () => {
    const out = formatAliasResult(result);
    expect(out).toContain('Applied aliases');
    expect(out).toContain('DB');
  });

  it('includes missing section', () => {
    const out = formatAliasResult(result);
    expect(out).toContain('Missing source keys');
    expect(out).toContain('MISSING_KEY');
  });

  it('includes conflicts section', () => {
    const out = formatAliasResult(result);
    expect(out).toContain('Conflicts');
    expect(out).toContain('PORT');
  });

  it('returns empty string when all arrays are empty', () => {
    const empty: AliasResult = { output: {}, applied: [], missing: [], conflicts: [] };
    expect(formatAliasResult(empty)).toBe('');
  });
});

describe('formatAliasSummary', () => {
  it('shows counts for applied, missing, conflicts', () => {
    const result: AliasResult = {
      output: {},
      applied: [{ alias: 'A', original: 'B', value: 'v' }],
      missing: ['X', 'Y'],
      conflicts: [],
    };
    const out = formatAliasSummary(result);
    expect(out).toContain('1 applied');
    expect(out).toContain('2 missing');
    expect(out).toContain('0 conflicts');
  });
});
