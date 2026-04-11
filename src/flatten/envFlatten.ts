/**
 * envFlatten.ts
 * Flattens nested JSON/object structures into dot-notation .env keys,
 * and expands dot-notation .env keys back into nested objects.
 */

export interface FlattenResult {
  original: Record<string, string>;
  flattened: Record<string, string>;
  expandedKeys: string[];
}

export interface ExpandResult {
  original: Record<string, string>;
  expanded: Record<string, unknown>;
  keys: string[];
}

/**
 * Recursively flattens a nested object into dot-notation key/value pairs.
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
  separator = "_"
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const flatKey = prefix ? `${prefix}${separator}${key.toUpperCase()}` : key.toUpperCase();

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const nested = flattenObject(value as Record<string, unknown>, flatKey, separator);
      Object.assign(result, nested);
    } else if (Array.isArray(value)) {
      result[flatKey] = value.join(",");
    } else {
      result[flatKey] = String(value ?? "");
    }
  }

  return result;
}

/**
 * Expands dot/underscore-notation env keys into a nested object structure.
 */
export function expandToNested(
  env: Record<string, string>,
  separator = "_"
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(env)) {
    const parts = key.toLowerCase().split(separator);
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (typeof current[part] !== "object" || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

/**
 * Flattens a nested JSON object and merges into an existing env record.
 */
export function flattenEnv(
  env: Record<string, string>,
  json: Record<string, unknown>,
  separator = "_"
): FlattenResult {
  const flattened = flattenObject(json, "", separator);
  const merged = { ...env, ...flattened };
  const expandedKeys = Object.keys(flattened);

  return {
    original: env,
    flattened: merged,
    expandedKeys,
  };
}

/**
 * Expands env key/value pairs back into a nested object.
 */
export function expandEnv(
  env: Record<string, string>,
  keys: string[],
  separator = "_"
): ExpandResult {
  const subset: Record<string, string> = {};
  for (const key of keys) {
    if (key in env) subset[key] = env[key];
  }

  const expanded = expandToNested(subset, separator);

  return {
    original: env,
    expanded,
    keys: Object.keys(subset),
  };
}
