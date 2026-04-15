import { ParsedEnv } from '../parser/envParser';

export interface FreezeEntry {
  key: string;
  value: string;
  frozen: boolean;
}

export interface FreezeResult {
  frozen: FreezeEntry[];
  skipped: string[];
  frozenCount: number;
  skippedCount: number;
}

export interface FrozenStore {
  keys: Record<string, string>;
  frozenAt: string;
}

/**
 * Freeze specific keys from a parsed env, capturing their current values.
 * Returns a FrozenStore that can be persisted.
 */
export function freezeKeys(
  env: ParsedEnv,
  keys: string[]
): { store: FrozenStore; result: FreezeResult } {
  const frozenEntries: FreezeEntry[] = [];
  const skipped: string[] = [];
  const storeKeys: Record<string, string> = {};

  for (const key of keys) {
    if (key in env) {
      const value = env[key];
      frozenEntries.push({ key, value, frozen: true });
      storeKeys[key] = value;
    } else {
      skipped.push(key);
    }
  }

  const store: FrozenStore = {
    keys: storeKeys,
    frozenAt: new Date().toISOString(),
  };

  const result: FreezeResult = {
    frozen: frozenEntries,
    skipped,
    frozenCount: frozenEntries.length,
    skippedCount: skipped.length,
  };

  return { store, result };
}

/**
 * Check whether any frozen keys have drifted from their frozen values.
 */
export interface DriftEntry {
  key: string;
  frozenValue: string;
  currentValue: string | undefined;
  drifted: boolean;
}

export interface DriftResult {
  entries: DriftEntry[];
  driftedCount: number;
  missingCount: number;
  clean: boolean;
}

export function checkFreezeDrift(
  env: ParsedEnv,
  store: FrozenStore
): DriftResult {
  const entries: DriftEntry[] = [];
  let driftedCount = 0;
  let missingCount = 0;

  for (const [key, frozenValue] of Object.entries(store.keys)) {
    const currentValue = env[key];
    const drifted = currentValue !== frozenValue;

    if (currentValue === undefined) missingCount++;
    else if (drifted) driftedCount++;

    entries.push({ key, frozenValue, currentValue, drifted });
  }

  return {
    entries,
    driftedCount,
    missingCount,
    clean: driftedCount === 0 && missingCount === 0,
  };
}
