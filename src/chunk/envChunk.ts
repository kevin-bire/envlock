import { ParsedEnv } from '../parser/envParser';

export interface ChunkResult {
  chunks: ParsedEnv[];
  totalKeys: number;
  chunkCount: number;
}

export interface ChunkOptions {
  size?: number;
  count?: number;
}

export function chunkBySize(env: ParsedEnv, size: number): ParsedEnv[] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0');
  const entries = Object.entries(env);
  const chunks: ParsedEnv[] = [];
  for (let i = 0; i < entries.length; i += size) {
    const slice = entries.slice(i, i + size);
    chunks.push(Object.fromEntries(slice));
  }
  return chunks;
}

export function chunkByCount(env: ParsedEnv, count: number): ParsedEnv[] {
  if (count <= 0) throw new Error('Chunk count must be greater than 0');
  const entries = Object.entries(env);
  const total = entries.length;
  const size = Math.ceil(total / count);
  return chunkBySize(env, size);
}

export function chunkEnv(env: ParsedEnv, options: ChunkOptions): ChunkResult {
  const { size, count } = options;
  if (size === undefined && count === undefined) {
    throw new Error('Either size or count must be specified');
  }

  let chunks: ParsedEnv[];
  if (size !== undefined) {
    chunks = chunkBySize(env, size);
  } else {
    chunks = chunkByCount(env, count!);
  }

  return {
    chunks,
    totalKeys: Object.keys(env).length,
    chunkCount: chunks.length,
  };
}
