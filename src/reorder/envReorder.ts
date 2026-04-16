export interface ReorderResult {
  original: Record<string, string>;
  reordered: Record<string, string>;
  order: string[];
  unchanged: boolean;
}

export function reorderByKeys(
  env: Record<string, string>,
  keys: string[]
): ReorderResult {
  const reordered: Record<string, string> = {};
  const remaining = new Set(Object.keys(env));

  for (const key of keys) {
    if (key in env) {
      reordered[key] = env[key];
      remaining.delete(key);
    }
  }

  for (const key of remaining) {
    reordered[key] = env[key];
  }

  const originalKeys = Object.keys(env);
  const reorderedKeys = Object.keys(reordered);
  const unchanged = originalKeys.every((k, i) => k === reorderedKeys[i]);

  return { original: env, reordered, order: reorderedKeys, unchanged };
}

export function reorderAlphabetically(
  env: Record<string, string>
): ReorderResult {
  const keys = Object.keys(env).sort();
  return reorderByKeys(env, keys);
}

export function reorderEnv(
  env: Record<string, string>,
  options: { keys?: string[]; alpha?: boolean } = {}
): ReorderResult {
  if (options.alpha) return reorderAlphabetically(env);
  if (options.keys && options.keys.length > 0) return reorderByKeys(env, options.keys);
  return { original: env, reordered: { ...env }, order: Object.keys(env), unchanged: true };
}
