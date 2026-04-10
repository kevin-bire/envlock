import { ParsedEnv } from '../parser/envParser';

export interface InterpolateOptions {
  allowMissing?: boolean;
  maxDepth?: number;
}

export interface InterpolateResult {
  interpolated: ParsedEnv;
  unresolved: string[];
  cycles: string[];
}

const VAR_PATTERN = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g;

export function resolveValue(
  key: string,
  env: ParsedEnv,
  visited: Set<string> = new Set(),
  depth: number = 0,
  maxDepth: number = 10
): { value: string; unresolved: string[]; cycle: boolean } {
  if (depth > maxDepth) {
    return { value: env[key] ?? '', unresolved: [], cycle: true };
  }

  if (visited.has(key)) {
    return { value: env[key] ?? '', unresolved: [], cycle: true };
  }

  const raw = env[key];
  if (raw === undefined) {
    return { value: '', unresolved: [key], cycle: false };
  }

  visited.add(key);
  const unresolved: string[] = [];

  const resolved = raw.replace(VAR_PATTERN, (_match, braced, bare) => {
    const refKey = braced ?? bare;
    if (!(refKey in env)) {
      unresolved.push(refKey);
      return _match;
    }
    const result = resolveValue(refKey, env, new Set(visited), depth + 1, maxDepth);
    unresolved.push(...result.unresolved);
    return result.value;
  });

  return { value: resolved, unresolved, cycle: false };
}

export function interpolateEnv(
  env: ParsedEnv,
  options: InterpolateOptions = {}
): InterpolateResult {
  const { allowMissing = true, maxDepth = 10 } = options;
  const interpolated: ParsedEnv = {};
  const allUnresolved: string[] = [];
  const cycles: string[] = [];

  for (const key of Object.keys(env)) {
    const { value, unresolved, cycle } = resolveValue(key, env, new Set(), 0, maxDepth);
    if (cycle) {
      cycles.push(key);
      interpolated[key] = env[key];
    } else {
      if (!allowMissing && unresolved.length > 0) {
        throw new Error(`Unresolved variable(s) for key "${key}": ${unresolved.join(', ')}`);
      }
      allUnresolved.push(...unresolved);
      interpolated[key] = value;
    }
  }

  return {
    interpolated,
    unresolved: [...new Set(allUnresolved)],
    cycles: [...new Set(cycles)],
  };
}
