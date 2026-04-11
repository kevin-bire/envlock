import { ParsedEnv } from '../parser/envParser';

export interface RequiredCheckResult {
  key: string;
  present: boolean;
  value?: string;
}

export interface RequiredEnvResult {
  checks: RequiredCheckResult[];
  missing: string[];
  present: string[];
  allSatisfied: boolean;
}

export function checkRequired(
  env: ParsedEnv,
  requiredKeys: string[]
): RequiredEnvResult {
  const checks: RequiredCheckResult[] = requiredKeys.map((key) => {
    const value = env[key];
    const present = value !== undefined && value !== '';
    return { key, present, value };
  });

  const missing = checks.filter((c) => !c.present).map((c) => c.key);
  const present = checks.filter((c) => c.present).map((c) => c.key);
  const allSatisfied = missing.length === 0;

  return { checks, missing, present, allSatisfied };
}

export function getMissingRequired(
  env: ParsedEnv,
  requiredKeys: string[]
): string[] {
  return requiredKeys.filter((key) => {
    const value = env[key];
    return value === undefined || value === '';
  });
}
