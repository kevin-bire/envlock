export interface UpperResult {
  env: Record<string, string>;
  changed: string[];
  skipped: string[];
}

export function upperKeys(env: Record<string, string>): UpperResult {
  const result: Record<string, string> = {};
  const changed: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const upper = key.toUpperCase();
    if (upper !== key) {
      changed.push(key);
    } else {
      skipped.push(key);
    }
    result[upper] = value;
  }

  return { env: result, changed, skipped };
}

export function upperValues(env: Record<string, string>): UpperResult {
  const result: Record<string, string> = {};
  const changed: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const upper = value.toUpperCase();
    if (upper !== value) {
      changed.push(key);
    } else {
      skipped.push(key);
    }
    result[key] = upper;
  }

  return { env: result, changed, skipped };
}

export function upperEnv(
  env: Record<string, string>,
  target: 'keys' | 'values' | 'both' = 'keys'
): UpperResult {
  if (target === 'keys') return upperKeys(env);
  if (target === 'values') return upperValues(env);

  const keysResult = upperKeys(env);
  const valuesResult = upperValues(keysResult.env);

  return {
    env: valuesResult.env,
    changed: Array.from(new Set([...keysResult.changed, ...valuesResult.changed])),
    skipped: valuesResult.skipped.filter(k => !keysResult.changed.includes(k)),
  };
}
