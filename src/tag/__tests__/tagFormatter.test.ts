import {
  formatTagEntry,
  formatTagIndex,
  formatTagResult,
  formatTagSummary,
  formatFilteredByTag,
} from '../tagFormatter';
import { TaggedEntry, TagIndex, TagAnalysis } from '../envTag';

const entry: TaggedEntry = { key: 'DB_URL', value: 'postgres://localhost', tags: ['db', 'required'] };
const untagged: TaggedEntry = { key: 'PORT', value: '3000', tags: [] };

describe('formatTagEntry', () => {
  it('formats an entry with tags', () => {
    const result = formatTagEntry(entry);
    expect(result).toContain('DB_URL=postgres://localhost');
    expect(result).toContain('[db, required]');
  });

  it('masks the value when mask=true', () => {
    const result = formatTagEntry(entry, true);
    expect(result).toContain('DB_URL=****');
    expect(result).not.toContain('postgres');
  });

  it('shows [untagged] for entries with no tags', () => {
    const result = formatTagEntry(untagged);
    expect(result).toContain('[untagged]');
  });
});

describe('formatTagIndex', () => {
  it('formats a tag index', () => {
    const index: TagIndex = { db: ['DB_URL', 'DB_PASS'], required: ['DB_URL'] };
    const result = formatTagIndex(index);
    expect(result).toContain('Tag Index:');
    expect(result).toContain('db: DB_URL, DB_PASS');
    expect(result).toContain('required: DB_URL');
  });
});

describe('formatTagResult', () => {
  it('returns message when no entries', () => {
    expect(formatTagResult([])).toBe('No tagged entries found.');
  });

  it('formats multiple entries', () => {
    const result = formatTagResult([entry, untagged]);
    expect(result).toContain('DB_URL');
    expect(result).toContain('PORT');
  });
});

describe('formatTagSummary', () => {
  it('formats analysis summary', () => {
    const analysis: TagAnalysis = {
      totalKeys: 5,
      taggedKeys: 3,
      uniqueTags: 2,
      tagCounts: { db: 2, required: 1 },
    };
    const result = formatTagSummary(analysis);
    expect(result).toContain('Total keys:   5');
    expect(result).toContain('Tagged keys:  3');
    expect(result).toContain('Unique tags:  2');
    expect(result).toContain('db: 2');
    expect(result).toContain('required: 1');
  });
});

describe('formatFilteredByTag', () => {
  it('returns message when no matching entries', () => {
    expect(formatFilteredByTag('secret', [])).toBe('No keys found with tag "secret".');
  });

  it('formats filtered entries with header', () => {
    const result = formatFilteredByTag('db', [entry]);
    expect(result).toContain('Keys tagged "db" (1):');
    expect(result).toContain('DB_URL');
  });

  it('masks values when requested', () => {
    const result = formatFilteredByTag('db', [entry], true);
    expect(result).toContain('****');
    expect(result).not.toContain('postgres');
  });
});
