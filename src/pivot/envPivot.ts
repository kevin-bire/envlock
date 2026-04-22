/**
 * envPivot.ts
 * Pivot env entries by prefix into structured key-value groups,
 * or flatten a pivot map back into a flat env record.
 */

export interface PivotGroup {
  prefix: string;
  entries: Record<string, string>;
}

export interface PivotResult {
  groups: PivotGroup[];
  unprefixed: Record<string, string>;
  totalKeys: number;
}

/**
 * Pivot a flat env record into groups keyed by prefix.
 * Keys without a matching prefix land in `unprefixed`.
 */
export function pivotEnv(
  env: Record<string, string>,
  prefixes: string[]
): PivotResult {
  const groupMap = new Map<string, Record<string, string>>();
  const unprefixed: Record<string, string> = {};

  for (const prefix of prefixes) {
    groupMap.set(prefix, {});
  }

  for (const [key, value] of Object.entries(env)) {
    const matched = prefixes.find((p) => key.startsWith(p + "_") || key === p);
    if (matched) {
      const short = key.startsWith(matched + "_")
        ? key.slice(matched.length + 1)
        : key;
      groupMap.get(matched)![short] = value;
    } else {
      unprefixed[key] = value;
    }
  }

  const groups: PivotGroup[] = [];
  for (const [prefix, entries] of groupMap.entries()) {
    groups.push({ prefix, entries });
  }

  return {
    groups,
    unprefixed,
    totalKeys: Object.keys(env).length,
  };
}

/**
 * Flatten a pivot result back into a flat env record.
 * Prefixed keys are reconstructed as PREFIX_KEY.
 */
export function flattenPivot(result: PivotResult): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const { prefix, entries } of result.groups) {
    for (const [short, value] of Object.entries(entries)) {
      const key = short === prefix ? prefix : `${prefix}_${short}`;
      flat[key] = value;
    }
  }

  Object.assign(flat, result.unprefixed);
  return flat;
}
