import { ParsedEnv } from '../parser/envParser';

export interface SplitResult {
  chunks: Record<string, ParsedEnv>;
  totalKeys: number;
  chunkCount: number;
}

export interface SplitOptions {
  chunkSize?: number;
  prefixes?: string[];
}

/**
 * Split a ParsedEnv into chunks of a given size.
 */
export function splitByChunkSize(
  env: ParsedEnv,
  chunkSize: number
): Record<string, ParsedEnv> {
  const entries = Object.entries(env);
  const chunks: Record<string, ParsedEnv> = {};
  let index = 0;

  for (let i = 0; i < entries.length; i += chunkSize) {
    const slice = entries.slice(i, i + chunkSize);
    const chunk: ParsedEnv = {};
    for (const [key, value] of slice) {
      chunk[key] = value;
    }
    chunks[`chunk_${++index}`] = chunk;
  }

  return chunks;
}

/**
 * Split a ParsedEnv into groups by key prefix.
 */
export function splitByPrefixes(
  env: ParsedEnv,
  prefixes: string[]
): Record<string, ParsedEnv> {
  const result: Record<string, ParsedEnv> = {};

  for (const prefix of prefixes) {
    result[prefix] = {};
  }
  result['__other__'] = {};

  for (const [key, value] of Object.entries(env)) {
    const matched = prefixes.find((p) => key.startsWith(p));
    if (matched) {
      result[matched][key] = value;
    } else {
      result['__other__'][key] = value;
    }
  }

  // Remove empty groups
  for (const group of Object.keys(result)) {
    if (Object.keys(result[group]).length === 0) {
      delete result[group];
    }
  }

  return result;
}

/**
 * Main split entry point.
 */
export function splitEnv(env: ParsedEnv, options: SplitOptions = {}): SplitResult {
  let chunks: Record<string, ParsedEnv>;

  if (options.prefixes && options.prefixes.length > 0) {
    chunks = splitByPrefixes(env, options.prefixes);
  } else {
    const chunkSize = options.chunkSize ?? 10;
    chunks = splitByChunkSize(env, chunkSize);
  }

  return {
    chunks,
    totalKeys: Object.keys(env).length,
    chunkCount: Object.keys(chunks).length,
  };
}
