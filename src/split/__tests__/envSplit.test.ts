import { splitEnv, splitByChunkSize, splitByPrefixes } from '../envSplit';
import { ParsedEnv } from '../../parser/envParser';

const sampleEnv: ParsedEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'mydb',
  APP_PORT: '3000',
  APP_ENV: 'production',
  REDIS_HOST: 'redis',
  REDIS_PORT: '6379',
  SECRET_KEY: 'abc123',
};

describe('splitByChunkSize', () => {
  it('splits env into chunks of given size', () => {
    const chunks = splitByChunkSize(sampleEnv, 3);
    const keys = Object.keys(chunks);
    expect(keys.length).toBe(3); // 8 keys / 3 = 3 chunks
    expect(Object.keys(chunks['chunk_1']).length).toBe(3);
    expect(Object.keys(chunks['chunk_2']).length).toBe(3);
    expect(Object.keys(chunks['chunk_3']).length).toBe(2);
  });

  it('returns single chunk when size >= total keys', () => {
    const chunks = splitByChunkSize(sampleEnv, 100);
    expect(Object.keys(chunks).length).toBe(1);
    expect(Object.keys(chunks['chunk_1']).length).toBe(8);
  });

  it('returns empty object for empty env', () => {
    const chunks = splitByChunkSize({}, 5);
    expect(Object.keys(chunks).length).toBe(0);
  });
});

describe('splitByPrefixes', () => {
  it('groups keys by prefix', () => {
    const chunks = splitByPrefixes(sampleEnv, ['DB_', 'APP_', 'REDIS_']);
    expect(Object.keys(chunks['DB_'])).toEqual(['DB_HOST', 'DB_PORT', 'DB_NAME']);
    expect(Object.keys(chunks['APP_'])).toEqual(['APP_PORT', 'APP_ENV']);
    expect(Object.keys(chunks['REDIS_'])).toEqual(['REDIS_HOST', 'REDIS_PORT']);
    expect(chunks['__other__']).toEqual({ SECRET_KEY: 'abc123' });
  });

  it('omits empty groups', () => {
    const chunks = splitByPrefixes(sampleEnv, ['DB_', 'NONEXISTENT_']);
    expect('NONEXISTENT_' in chunks).toBe(false);
  });

  it('puts all keys in __other__ when no prefix matches', () => {
    const chunks = splitByPrefixes({ FOO: '1', BAR: '2' }, ['NOPE_']);
    expect(chunks['__other__']).toEqual({ FOO: '1', BAR: '2' });
  });
});

describe('splitEnv', () => {
  it('uses chunkSize by default (10)', () => {
    const result = splitEnv(sampleEnv);
    expect(result.chunkCount).toBe(1);
    expect(result.totalKeys).toBe(8);
  });

  it('uses prefixes when provided', () => {
    const result = splitEnv(sampleEnv, { prefixes: ['DB_', 'APP_'] });
    expect(result.chunks['DB_']).toBeDefined();
    expect(result.chunks['APP_']).toBeDefined();
    expect(result.totalKeys).toBe(8);
  });

  it('respects custom chunkSize', () => {
    const result = splitEnv(sampleEnv, { chunkSize: 2 });
    expect(result.chunkCount).toBe(4);
  });

  it('returns correct totalKeys', () => {
    const result = splitEnv(sampleEnv, { chunkSize: 3 });
    expect(result.totalKeys).toBe(8);
  });
});
