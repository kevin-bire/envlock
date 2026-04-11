import { ParsedEnv } from '../parser/envParser';

export interface CountResult {
  total: number;
  empty: number;
  nonEmpty: number;
  commented: number;
  byPrefix: Record<string, number>;
}

export function countByPrefix(env: ParsedEnv): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const key of Object.keys(env)) {
    const parts = key.split('_');
    if (parts.length > 1) {
      const prefix = parts[0];
      counts[prefix] = (counts[prefix] ?? 0) + 1;
    }
  }
  return counts;
}

export function countEnv(
  env: ParsedEnv,
  comments: string[] = []
): CountResult {
  const keys = Object.keys(env);
  const total = keys.length;
  const empty = keys.filter((k) => env[k] === '').length;
  const nonEmpty = total - empty;
  const commented = comments.filter((line) =>
    line.trimStart().startsWith('#')
  ).length;
  const byPrefix = countByPrefix(env);

  return {
    total,
    empty,
    nonEmpty,
    commented,
    byPrefix,
  };
}
