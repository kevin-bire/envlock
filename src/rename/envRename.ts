import { ParsedEnv } from '../parser/envParser';

export interface RenameOperation {
  oldKey: string;
  newKey: string;
}

export interface RenameResult {
  renamed: RenameOperation[];
  skipped: RenameOperation[];
  notFound: RenameOperation[];
  output: ParsedEnv;
}

export function renameKeys(
  env: ParsedEnv,
  operations: RenameOperation[]
): RenameResult {
  const result: RenameResult = {
    renamed: [],
    skipped: [],
    notFound: [],
    output: { ...env },
  };

  for (const op of operations) {
    const { oldKey, newKey } = op;

    if (!(oldKey in result.output)) {
      result.notFound.push(op);
      continue;
    }

    if (newKey in result.output) {
      result.skipped.push(op);
      continue;
    }

    result.output[newKey] = result.output[oldKey];
    delete result.output[oldKey];
    result.renamed.push(op);
  }

  return result;
}

export function buildRenameMap(
  pairs: string[]
): RenameOperation[] {
  return pairs.map((pair) => {
    const [oldKey, newKey] = pair.split(':');
    if (!oldKey || !newKey) {
      throw new Error(
        `Invalid rename pair "${pair}". Expected format: OLD_KEY:NEW_KEY`
      );
    }
    return { oldKey: oldKey.trim(), newKey: newKey.trim() };
  });
}
