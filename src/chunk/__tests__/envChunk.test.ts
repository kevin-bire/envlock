import { chunkBySize, chunkByCount, chunkEnv } from '../envChunk';
import { formatChunkResult, formatChunkSummary } from '../chunkFormatter';

const sampleEnv = {
  A: '1',
  B: '2',
  C: '3',
  D: '4',
  E: '5',
};

describe('chunkBySize', () => {
  it('splits env into chunks of given size', () => {
    const chunks = chunkBySize(sampleEnv, 2);
    expect(chunks).toHaveLength(3);
    expect(Object.keys(chunks[0])).toEqual(['A', 'B']);
    expect(Object.keys(chunks[1])).toEqual(['C', 'D']);
    expect(Object.keys(chunks[2])).toEqual(['E']);
  });

  it('returns single chunk when size >= total keys', () => {
    const chunks = chunkBySize(sampleEnv, 10);
    expect(chunks).toHaveLength(1);
    expect(Object.keys(chunks[0])).toHaveLength(5);
  });

  it('throws on size <= 0', () => {
    expect(() => chunkBySize(sampleEnv, 0)).toThrow();
  });
});

describe('chunkByCount', () => {
  it('splits env into given number of chunks', () => {
    const chunks = chunkByCount(sampleEnv, 2);
    expect(chunks).toHaveLength(2);
    expect(Object.keys(chunks[0])).toHaveLength(3);
    expect(Object.keys(chunks[1])).toHaveLength(2);
  });

  it('throws on count <= 0', () => {
    expect(() => chunkByCount(sampleEnv, 0)).toThrow();
  });
});

describe('chunkEnv', () => {
  it('uses size when provided', () => {
    const result = chunkEnv(sampleEnv, { size: 2 });
    expect(result.chunkCount).toBe(3);
    expect(result.totalKeys).toBe(5);
  });

  it('uses count when provided', () => {
    const result = chunkEnv(sampleEnv, { count: 2 });
    expect(result.chunkCount).toBe(2);
  });

  it('throws when neither size nor count given', () => {
    expect(() => chunkEnv(sampleEnv, {})).toThrow();
  });
});

describe('chunkFormatter', () => {
  it('formatChunkResult includes chunk headers', () => {
    const result = chunkEnv(sampleEnv, { size: 3 });
    const output = formatChunkResult(result);
    expect(output).toContain('Chunk 1');
    expect(output).toContain('Chunk 2');
    expect(output).toContain('A=1');
  });

  it('formatChunkSummary shows totals', () => {
    const result = chunkEnv(sampleEnv, { size: 2 });
    const summary = formatChunkSummary(result);
    expect(summary).toContain('Total keys  : 5');
    expect(summary).toContain('Chunks      : 3');
  });
});
