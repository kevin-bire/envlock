import { EnvMap } from '../parser/envParser';

export interface SummarizeResult {
  total: number;
  empty: number;
  nonEmpty: number;
  prefixes: Record<string, number>;
  longestKey: string;
  shortestKey: string;
  averageValueLength: number;
  uniqueValues: number;
}

export function summarizeEnv(env: EnvMap): SummarizeResult {
  const keys = Object.keys(env);
  const total = keys.length;

  if (total === 0) {
    return {
      total: 0,
      empty: 0,
      nonEmpty: 0,
      prefixes: {},
      longestKey: '',
      shortestKey: '',
      averageValueLength: 0,
      uniqueValues: 0,
    };
  }

  const empty = keys.filter((k) => env[k] === '').length;
  const nonEmpty = total - empty;

  const prefixes: Record<string, number> = {};
  for (const key of keys) {
    const parts = key.split('_');
    if (parts.length > 1) {
      const prefix = parts[0];
      prefixes[prefix] = (prefixes[prefix] ?? 0) + 1;
    }
  }

  const sortedByLength = [...keys].sort((a, b) => b.length - a.length);
  const longestKey = sortedByLength[0];
  const shortestKey = sortedByLength[sortedByLength.length - 1];

  const values = keys.map((k) => env[k]);
  const totalValueLength = values.reduce((sum, v) => sum + v.length, 0);
  const averageValueLength = Math.round(totalValueLength / total);

  const uniqueValues = new Set(values).size;

  return {
    total,
    empty,
    nonEmpty,
    prefixes,
    longestKey,
    shortestKey,
    averageValueLength,
    uniqueValues,
  };
}
