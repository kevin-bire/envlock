export type FieldType = 'string' | 'number' | 'boolean' | 'url' | 'email';

export interface SchemaField {
  type: FieldType;
  required: boolean;
  description?: string;
  pattern?: string;
}

export interface EnvSchema {
  [key: string]: SchemaField;
}

export interface ValidationError {
  key: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

const TYPE_VALIDATORS: Record<FieldType, (value: string) => boolean> = {
  string: () => true,
  number: (v) => !isNaN(Number(v)) && v.trim() !== '',
  boolean: (v) => ['true', 'false', '1', '0'].includes(v.toLowerCase()),
  url: (v) => { try { new URL(v); return true; } catch { return false; } },
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
};

export function validateEnv(
  env: Record<string, string>,
  schema: EnvSchema
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const value = env[key];

    if (value === undefined || value === '') {
      if (field.required) {
        errors.push({ key, message: `Required field "${key}" is missing or empty.` });
      } else {
        warnings.push(`Optional field "${key}" is not set.`);
      }
      continue;
    }

    if (!TYPE_VALIDATORS[field.type](value)) {
      errors.push({ key, message: `Field "${key}" must be of type ${field.type}.` });
    }

    if (field.pattern && !new RegExp(field.pattern).test(value)) {
      errors.push({ key, message: `Field "${key}" does not match pattern ${field.pattern}.` });
    }
  }

  for (const key of Object.keys(env)) {
    if (!schema[key]) {
      warnings.push(`Field "${key}" is not defined in schema.`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
