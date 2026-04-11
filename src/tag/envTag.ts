import { ParsedEnv } from '../parser/envParser';

export interface TagStore {
  [key: string]: string[];
}

export interface TagResult {
  tagged: Record<string, string[]>;
  untagged: string[];
  tagIndex: Record<string, string[]>;
}

/**
 * Assign tags to environment variable keys.
 */
export function tagKeys(
  env: ParsedEnv,
  assignments: Record<string, string[]>
): TagStore {
  const store: TagStore = {};
  for (const key of Object.keys(env)) {
    if (assignments[key]) {
      store[key] = [...new Set(assignments[key])];
    }
  }
  return store;
}

/**
 * Build an inverted index: tag -> list of keys
 */
export function buildTagIndex(store: TagStore): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  for (const [key, tags] of Object.entries(store)) {
    for (const tag of tags) {
      if (!index[tag]) index[tag] = [];
      index[tag].push(key);
    }
  }
  return index;
}

/**
 * Filter env keys that match ALL provided tags.
 */
export function filterByTags(
  env: ParsedEnv,
  store: TagStore,
  tags: string[]
): ParsedEnv {
  const result: ParsedEnv = {};
  for (const key of Object.keys(env)) {
    const keyTags = store[key] ?? [];
    if (tags.every((t) => keyTags.includes(t))) {
      result[key] = env[key];
    }
  }
  return result;
}

/**
 * Produce a full tag analysis result for an env.
 */
export function analyzeTagged(
  env: ParsedEnv,
  store: TagStore
): TagResult {
  const tagged: Record<string, string[]> = {};
  const untagged: string[] = [];

  for (const key of Object.keys(env)) {
    if (store[key] && store[key].length > 0) {
      tagged[key] = store[key];
    } else {
      untagged.push(key);
    }
  }

  const tagIndex = buildTagIndex(store);
  return { tagged, untagged, tagIndex };
}
