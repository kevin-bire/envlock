import { ParsedEnv } from '../parser/envParser';

export interface PruneOptions {
  keepKeys?: string[];
  removeEmpty?: boolean;
  removeCommented?: boolean;
  dryRun?: boolean;
}

export interface PruneResult {
  original: ParsedEnv;
  pruned: ParsedEnv;
  removedKeys: string[];
  removedEmpty: string[];
  keptKeys: string[];
}

export function pruneEmpty(env: ParsedEnv): string[] {
  return Object.entries(env)
    .filter(([, value]) => value === '' || value === null || value === undefined)
    .map(([key]) => key);
}

export function pruneByAllowlist(env: ParsedEnv, keepKeys: string[]): string[] {
  const keepSet = new Set(keepKeys);
  return Object.keys(env).filter((key) => !keepSet.has(key));
}

export function pruneEnv(
  env: ParsedEnv,
  options: PruneOptions = {}
): PruneResult {
  const { keepKeys = [], removeEmpty = false } = options;

  const removedKeys: string[] = [];
  const removedEmpty: string[] = [];

  if (keepKeys.length > 0) {
    const byAllowlist = pruneByAllowlist(env, keepKeys);
    removedKeys.push(...byAllowlist);
  }

  if (removeEmpty) {
    const emptyKeys = pruneEmpty(env).filter(
      (k) => !removedKeys.includes(k)
    );
    removedEmpty.push(...emptyKeys);
  }

  const allRemoved = new Set([...removedKeys, ...removedEmpty]);

  const pruned: ParsedEnv = {};
  for (const [key, value] of Object.entries(env)) {
    if (!allRemoved.has(key)) {
      pruned[key] = value;
    }
  }

  const keptKeys = Object.keys(pruned);

  return {
    original: env,
    pruned,
    removedKeys,
    removedEmpty,
    keptKeys,
  };
}
