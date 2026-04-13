import { ParsedEnv } from '../parser/envParser';

export type TransformFn = (key: string, value: string) => string;

export interface TransformRule {
  key?: string | RegExp;
  fn: TransformFn;
}

export interface TransformResult {
  original: ParsedEnv;
  transformed: ParsedEnv;
  changes: TransformChange[];
}

export interface TransformChange {
  key: string;
  before: string;
  after: string;
}

export function applyRule(
  env: ParsedEnv,
  rule: TransformRule
): { env: ParsedEnv; changes: TransformChange[] } {
  const changes: TransformChange[] = [];
  const result: ParsedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    const matches =
      rule.key === undefined ||
      (typeof rule.key === 'string' ? rule.key === key : rule.key.test(key));

    if (matches) {
      const after = rule.fn(key, value);
      result[key] = after;
      if (after !== value) {
        changes.push({ key, before: value, after });
      }
    } else {
      result[key] = value;
    }
  }

  return { env: result, changes };
}

export function transformEnv(
  env: ParsedEnv,
  rules: TransformRule[]
): TransformResult {
  let current = { ...env };
  const allChanges: TransformChange[] = [];

  for (const rule of rules) {
    const { env: next, changes } = applyRule(current, rule);
    current = next;
    allChanges.push(...changes);
  }

  return {
    original: env,
    transformed: current,
    changes: allChanges,
  };
}
