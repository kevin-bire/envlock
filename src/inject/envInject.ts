import { ParsedEnv } from '../parser/envParser';

export interface InjectOptions {
  override?: boolean;
  prefix?: string;
  dryRun?: boolean;
}

export interface InjectResult {
  injected: string[];
  skipped: string[];
  total: number;
  dryRun: boolean;
}

/**
 * Injects parsed env entries into process.env.
 * Respects override and prefix options.
 */
export function injectEnv(
  env: ParsedEnv,
  options: InjectOptions = {}
): InjectResult {
  const { override = false, prefix = '', dryRun = false } = options;

  const injected: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const targetKey = prefix ? `${prefix}${key}` : key;

    if (!override && targetKey in process.env) {
      skipped.push(targetKey);
      continue;
    }

    if (!dryRun) {
      process.env[targetKey] = value;
    }

    injected.push(targetKey);
  }

  return {
    injected,
    skipped,
    total: injected.length + skipped.length,
    dryRun,
  };
}

/**
 * Removes previously injected keys from process.env.
 */
export function ejectEnv(keys: string[]): string[] {
  const removed: string[] = [];

  for (const key of keys) {
    if (key in process.env) {
      delete process.env[key];
      removed.push(key);
    }
  }

  return removed;
}
