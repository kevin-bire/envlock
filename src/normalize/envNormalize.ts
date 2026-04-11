import { ParsedEnv } from '../parser/envParser';

export type NormalizeOptions = {
  uppercaseKeys?: boolean;
  lowercaseValues?: boolean;
  trimValues?: boolean;
  removeEmpty?: boolean;
  replacer?: (key: string, value: string) => string;
};

export type NormalizeChange = {
  key: string;
  original: string;
  normalized: string;
  reason: string;
};

export type NormalizeResult = {
  env: ParsedEnv;
  changes: NormalizeChange[];
  removedKeys: string[];
};

export function normalizeEnv(
  env: ParsedEnv,
  options: NormalizeOptions = {}
): NormalizeResult {
  const result: ParsedEnv = {};
  const changes: NormalizeChange[] = [];
  const removedKeys: string[] = [];

  for (const [rawKey, rawValue] of Object.entries(env)) {
    if (options.removeEmpty && rawValue === '') {
      removedKeys.push(rawKey);
      continue;
    }

    let key = rawKey;
    let value = rawValue;

    if (options.uppercaseKeys && key !== key.toUpperCase()) {
      const prev = key;
      key = key.toUpperCase();
      changes.push({ key: prev, original: prev, normalized: key, reason: 'uppercased key' });
    }

    if (options.trimValues && value !== value.trim()) {
      const prev = value;
      value = value.trim();
      changes.push({ key, original: prev, normalized: value, reason: 'trimmed value' });
    }

    if (options.lowercaseValues && value !== value.toLowerCase()) {
      const prev = value;
      value = value.toLowerCase();
      changes.push({ key, original: prev, normalized: value, reason: 'lowercased value' });
    }

    if (options.replacer) {
      const prev = value;
      value = options.replacer(key, value);
      if (value !== prev) {
        changes.push({ key, original: prev, normalized: value, reason: 'custom replacer' });
      }
    }

    result[key] = value;
  }

  return { env: result, changes, removedKeys };
}
