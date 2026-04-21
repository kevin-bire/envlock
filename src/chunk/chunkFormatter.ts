import { ChunkResult } from './envChunk';
import { ParsedEnv } from '../parser/envParser';

export function formatChunkSection(index: number, chunk: ParsedEnv): string {
  const lines: string[] = [];
  lines.push(`--- Chunk ${index + 1} (${Object.keys(chunk).length} keys) ---`);
  for (const [key, value] of Object.entries(chunk)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}

export function formatChunkResult(result: ChunkResult): string {
  const lines: string[] = [];
  lines.push(`Chunked into ${result.chunkCount} part(s) from ${result.totalKeys} total keys:\n`);
  result.chunks.forEach((chunk, i) => {
    lines.push(formatChunkSection(i, chunk));
    lines.push('');
  });
  return lines.join('\n').trimEnd();
}

export function formatChunkSummary(result: ChunkResult): string {
  const avgSize =
    result.chunkCount > 0
      ? (result.totalKeys / result.chunkCount).toFixed(1)
      : '0';
  return [
    `Total keys  : ${result.totalKeys}`,
    `Chunks      : ${result.chunkCount}`,
    `Avg per chunk: ${avgSize}`,
  ].join('\n');
}
