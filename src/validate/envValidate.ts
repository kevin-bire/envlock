import { ParsedEnv } from '../parser/envParser';
import { Schema } from '../schema/schemaLoader';
import { validateEnv, ValidationResult } from '../schema/schemaValidator';

export interface ValidateOptions {
  strict?: boolean;
  allowExtra?: boolean;
}

export interface EnvValidateResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingKeys: string[];
  extraKeys: string[];
}

export function validateEnvFile(
  env: ParsedEnv,
  schema: Schema,
  options: ValidateOptions = {}
): EnvValidateResult {
  const { strict = false, allowExtra = true } = options;
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingKeys: string[] = [];
  const extraKeys: string[] = [];

  const schemaKeys = new Set(Object.keys(schema));
  const envKeys = new Set(Object.keys(env));

  for (const key of schemaKeys) {
    if (!envKeys.has(key)) {
      const field = schema[key];
      if (field.required) {
        missingKeys.push(key);
        errors.push(`Missing required key: ${key}`);
      } else {
        warnings.push(`Optional key not set: ${key}`);
      }
    }
  }

  for (const key of envKeys) {
    if (!schemaKeys.has(key)) {
      extraKeys.push(key);
      if (!allowExtra || strict) {
        errors.push(`Unexpected key not in schema: ${key}`);
      } else {
        warnings.push(`Extra key not defined in schema: ${key}`);
      }
    }
  }

  const validationResult: ValidationResult = validateEnv(env, schema);
  for (const err of validationResult.errors) {
    errors.push(err);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingKeys,
    extraKeys,
  };
}

export function summarizeValidation(result: EnvValidateResult): string {
  const lines: string[] = [];
  lines.push(`Validation: ${result.valid ? 'PASSED' : 'FAILED'}`);
  lines.push(`  Errors:   ${result.errors.length}`);
  lines.push(`  Warnings: ${result.warnings.length}`);
  lines.push(`  Missing:  ${result.missingKeys.length}`);
  lines.push(`  Extra:    ${result.extraKeys.length}`);
  return lines.join('\n');
}
