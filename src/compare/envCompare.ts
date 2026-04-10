import { ParsedEnv } from '../parser/envParser';

export type CompareStatus = 'match' | 'mismatch' | 'missing_in_target' | 'missing_in_source';

export interface CompareEntry {
  key: string;
  status: CompareStatus;
  sourceValue?: string;
  targetValue?: string;
}

export interface CompareResult {
  entries: CompareEntry[];
  totalKeys: number;
  matchCount: number;
  mismatchCount: number;
  missingInTargetCount: number;
  missingInSourceCount: number;
}

export function compareEnvs(source: ParsedEnv, target: ParsedEnv): CompareResult {
  const allKeys = new Set([...Object.keys(source), ...Object.keys(target)]);
  const entries: CompareEntry[] = [];

  for (const key of allKeys) {
    const inSource = key in source;
    const inTarget = key in target;

    if (inSource && inTarget) {
      const status: CompareStatus = source[key] === target[key] ? 'match' : 'mismatch';
      entries.push({ key, status, sourceValue: source[key], targetValue: target[key] });
    } else if (inSource && !inTarget) {
      entries.push({ key, status: 'missing_in_target', sourceValue: source[key] });
    } else {
      entries.push({ key, status: 'missing_in_source', targetValue: target[key] });
    }
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    entries,
    totalKeys: allKeys.size,
    matchCount: entries.filter(e => e.status === 'match').length,
    mismatchCount: entries.filter(e => e.status === 'mismatch').length,
    missingInTargetCount: entries.filter(e => e.status === 'missing_in_target').length,
    missingInSourceCount: entries.filter(e => e.status === 'missing_in_source').length,
  };
}
