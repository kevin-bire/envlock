import { ParsedEnv } from '../parser/envParser';

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  order?: SortOrder;
  groupByPrefix?: boolean;
  prefixDelimiter?: string;
}

export interface SortResult {
  original: ParsedEnv;
  sorted: ParsedEnv;
  changed: boolean;
  movedKeys: string[];
}

export function sortEnv(
  env: ParsedEnv,
  options: SortOptions = {}
): SortResult {
  const { order = 'asc', groupByPrefix = false, prefixDelimiter = '_' } = options;

  const keys = Object.keys(env);

  let sortedKeys: string[];

  if (groupByPrefix) {
    sortedKeys = sortByPrefix(keys, order, prefixDelimiter);
  } else {
    sortedKeys = [...keys].sort((a, b) =>
      order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    );
  }

  const sorted: ParsedEnv = {};
  for (const key of sortedKeys) {
    sorted[key] = env[key];
  }

  const movedKeys = keys.filter((key, idx) => sortedKeys[idx] !== key);
  const changed = movedKeys.length > 0;

  return { original: env, sorted, changed, movedKeys };
}

function sortByPrefix(
  keys: string[],
  order: SortOrder,
  delimiter: string
): string[] {
  const getPrefix = (key: string) => {
    const idx = key.indexOf(delimiter);
    return idx !== -1 ? key.slice(0, idx) : key;
  };

  return [...keys].sort((a, b) => {
    const prefixA = getPrefix(a);
    const prefixB = getPrefix(b);
    const prefixCmp =
      order === 'asc'
        ? prefixA.localeCompare(prefixB)
        : prefixB.localeCompare(prefixA);
    if (prefixCmp !== 0) return prefixCmp;
    return order === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
  });
}
