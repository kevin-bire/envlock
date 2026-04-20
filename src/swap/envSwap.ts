import { ParsedEnv } from '../parser/envParser';

export interface SwapOperation {
  keyA: string;
  keyB: string;
}

export interface SwapResult {
  output: ParsedEnv;
  swapped: SwapOperation[];
  skipped: SwapOperation[];
  totalSwaps: number;
}

export function swapValues(env: ParsedEnv, operations: SwapOperation[]): SwapResult {
  const output: ParsedEnv = { ...env };
  const swapped: SwapOperation[] = [];
  const skipped: SwapOperation[] = [];

  for (const op of operations) {
    const { keyA, keyB } = op;

    const hasA = Object.prototype.hasOwnProperty.call(output, keyA);
    const hasB = Object.prototype.hasOwnProperty.call(output, keyB);

    if (!hasA || !hasB) {
      skipped.push(op);
      continue;
    }

    const temp = output[keyA];
    output[keyA] = output[keyB];
    output[keyB] = temp;
    swapped.push(op);
  }

  return {
    output,
    swapped,
    skipped,
    totalSwaps: swapped.length,
  };
}

export function swapKeys(env: ParsedEnv, operations: SwapOperation[]): SwapResult {
  const output: ParsedEnv = {};
  const swapped: SwapOperation[] = [];
  const skipped: SwapOperation[] = [];

  const keyRemap: Record<string, string> = {};

  for (const op of operations) {
    const { keyA, keyB } = op;
    const hasA = Object.prototype.hasOwnProperty.call(env, keyA);
    const hasB = Object.prototype.hasOwnProperty.call(env, keyB);

    if (!hasA || !hasB) {
      skipped.push(op);
      continue;
    }

    keyRemap[keyA] = keyB;
    keyRemap[keyB] = keyA;
    swapped.push(op);
  }

  for (const key of Object.keys(env)) {
    const newKey = keyRemap[key] ?? key;
    output[newKey] = env[key];
  }

  return {
    output,
    swapped,
    skipped,
    totalSwaps: swapped.length,
  };
}
