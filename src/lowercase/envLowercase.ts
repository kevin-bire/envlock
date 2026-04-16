export interface LowercaseResult {
  original: Record<string, string>;
  result: Record<string, string>;
  changes: LowercaseChange[];
}

export interface LowercaseChange {
  key: string;
  before: string;
  after: string;
  field: 'key' | 'value';
}

export function lowerKeys(env: Record<string, string>): LowercaseResult {
  const result: Record<string, string> = {};
  const changes: LowercaseChange[] = [];

  for (const [key, value] of Object.entries(env)) {
    const newKey = key.toLowerCase();
    result[newKey] = value;
    if (newKey !== key) {
      changes.push({ key, before: key, after: newKey, field: 'key' });
    }
  }

  return { original: env, result, changes };
}

export function lowerValues(env: Record<string, string>): LowercaseResult {
  const result: Record<string, string> = {};
  const changes: LowercaseChange[] = [];

  for (const [key, value] of Object.entries(env)) {
    const newValue = value.toLowerCase();
    result[key] = newValue;
    if (newValue !== value) {
      changes.push({ key, before: value, after: newValue, field: 'value' });
    }
  }

  return { original: env, result, changes };
}

export function lowerEnv(
  env: Record<string, string>,
  target: 'keys' | 'values' | 'both' = 'keys'
): LowercaseResult {
  if (target === 'keys') return lowerKeys(env);
  if (target === 'values') return lowerValues(env);

  const keysResult = lowerKeys(env);
  const bothResult = lowerValues(keysResult.result);
  return {
    original: env,
    result: bothResult.result,
    changes: [...keysResult.changes, ...bothResult.changes],
  };
}
