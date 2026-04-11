import {
  tagKeys,
  buildTagIndex,
  filterByTags,
  analyzeTagged,
} from '../envTag';
import { ParsedEnv } from '../../parser/envParser';

const env: ParsedEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret',
  DEBUG: 'true',
};

describe('tagKeys', () => {
  it('assigns tags to known keys', () => {
    const result = tagKeys(env, {
      DB_HOST: ['database', 'infra'],
      API_KEY: ['secret', 'auth'],
    });
    expect(result['DB_HOST']).toEqual(['database', 'infra']);
    expect(result['API_KEY']).toEqual(['secret', 'auth']);
    expect(result['DEBUG']).toBeUndefined();
  });

  it('deduplicates tags', () => {
    const result = tagKeys(env, { DB_HOST: ['infra', 'infra', 'database'] });
    expect(result['DB_HOST']).toEqual(['infra', 'database']);
  });

  it('ignores keys not in env', () => {
    const result = tagKeys(env, { UNKNOWN_KEY: ['tag1'] });
    expect(result['UNKNOWN_KEY']).toBeUndefined();
  });
});

describe('buildTagIndex', () => {
  it('inverts the tag store correctly', () => {
    const store = { DB_HOST: ['database', 'infra'], DB_PORT: ['database'] };
    const index = buildTagIndex(store);
    expect(index['database']).toEqual(['DB_HOST', 'DB_PORT']);
    expect(index['infra']).toEqual(['DB_HOST']);
  });

  it('returns empty index for empty store', () => {
    expect(buildTagIndex({})).toEqual({});
  });
});

describe('filterByTags', () => {
  const store = {
    DB_HOST: ['database', 'infra'],
    DB_PORT: ['database'],
    API_KEY: ['secret', 'auth'],
  };

  it('returns keys matching all specified tags', () => {
    const result = filterByTags(env, store, ['database']);
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('returns only keys matching multiple tags', () => {
    const result = filterByTags(env, store, ['database', 'infra']);
    expect(Object.keys(result)).toEqual(['DB_HOST']);
  });

  it('returns empty when no keys match', () => {
    const result = filterByTags(env, store, ['nonexistent']);
    expect(result).toEqual({});
  });
});

describe('analyzeTagged', () => {
  it('separates tagged and untagged keys', () => {
    const store = { DB_HOST: ['infra'], API_KEY: ['secret'] };
    const result = analyzeTagged(env, store);
    expect(Object.keys(result.tagged)).toContain('DB_HOST');
    expect(Object.keys(result.tagged)).toContain('API_KEY');
    expect(result.untagged).toContain('DB_PORT');
    expect(result.untagged).toContain('DEBUG');
  });

  it('includes tagIndex in result', () => {
    const store = { DB_HOST: ['infra'] };
    const result = analyzeTagged(env, store);
    expect(result.tagIndex['infra']).toEqual(['DB_HOST']);
  });

  it('all keys untagged when store is empty', () => {
    const result = analyzeTagged(env, {});
    expect(result.untagged).toHaveLength(Object.keys(env).length);
    expect(Object.keys(result.tagged)).toHaveLength(0);
  });
});
