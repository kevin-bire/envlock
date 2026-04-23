import { buildIndex, lookupKey, getOrderedKeys, filterIndex } from '../envIndex';
import {
  formatIndexEntry,
  formatIndexResult,
  formatIndexSummary,
  formatLookupResult,
} from '../indexFormatter';

describe('buildIndex', () => {
  it('builds an index from an env map', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const result = buildIndex(env);
    expect(result.total).toBe(2);
    expect(result.entries[0]).toEqual({ key: 'FOO', value: 'bar', position: 0 });
    expect(result.entries[1]).toEqual({ key: 'BAZ', value: 'qux', position: 1 });
  });

  it('returns empty result for empty env', () => {
    const result = buildIndex({});
    expect(result.total).toBe(0);
    expect(result.entries).toHaveLength(0);
  });
});

describe('lookupKey', () => {
  it('finds an existing key', () => {
    const index = buildIndex({ API_KEY: 'secret' });
    const entry = lookupKey(index, 'API_KEY');
    expect(entry).toBeDefined();
    expect(entry?.value).toBe('secret');
  });

  it('returns undefined for missing key', () => {
    const index = buildIndex({ FOO: 'bar' });
    expect(lookupKey(index, 'MISSING')).toBeUndefined();
  });
});

describe('getOrderedKeys', () => {
  it('returns keys in insertion order', () => {
    const env = { Z: '1', A: '2', M: '3' };
    const index = buildIndex(env);
    expect(getOrderedKeys(index)).toEqual(['Z', 'A', 'M']);
  });
});

describe('filterIndex', () => {
  it('filters entries by predicate', () => {
    const env = { FOO: 'bar', FOO_BAR: 'baz', OTHER: 'val' };
    const index = buildIndex(env);
    const filtered = filterIndex(index, (e) => e.key.startsWith('FOO'));
    expect(filtered).toHaveLength(2);
  });
});

describe('formatIndexEntry', () => {
  it('formats an entry normally', () => {
    expect(formatIndexEntry({ key: 'FOO', value: 'bar', position: 0 })).toBe('[0] FOO=bar');
  });

  it('masks value when sensitive', () => {
    expect(formatIndexEntry({ key: 'SECRET', value: 'abc', position: 1 }, true)).toBe('[1] SECRET=****');
  });
});

describe('formatIndexResult', () => {
  it('formats all entries', () => {
    const result = buildIndex({ A: '1', B: '2' });
    const output = formatIndexResult(result);
    expect(output).toContain('[0] A=1');
    expect(output).toContain('[1] B=2');
  });

  it('returns empty message for empty index', () => {
    expect(formatIndexResult(buildIndex({}))).toBe('Index is empty.');
  });
});

describe('formatIndexSummary', () => {
  it('uses singular for one key', () => {
    expect(formatIndexSummary(buildIndex({ A: '1' }))).toBe('Index contains 1 key.');
  });

  it('uses plural for multiple keys', () => {
    expect(formatIndexSummary(buildIndex({ A: '1', B: '2' }))).toBe('Index contains 2 keys.');
  });
});

describe('formatLookupResult', () => {
  it('formats found entry', () => {
    const index = buildIndex({ FOO: 'bar' });
    const entry = lookupKey(index, 'FOO');
    expect(formatLookupResult('FOO', entry)).toBe('Found: [0] FOO=bar');
  });

  it('formats missing key', () => {
    expect(formatLookupResult('MISSING', undefined)).toBe('Key "MISSING" not found in index.');
  });
});
