/**
 * envCast.ts — Cast env values to typed primitives
 */

export type CastType = 'string' | 'number' | 'boolean' | 'json';

export interface CastField {
  key: string;
  type: CastType;
}

export interface CastResult {
  casted: Record<string, unknown>;
  errors: CastError[];
}

export interface CastError {
  key: string;
  value: string;
  expectedType: CastType;
  message: string;
}

export function castValue(value: string, type: CastType): unknown {
  switch (type) {
    case 'string':
      return value;
    case 'number': {
      const n = Number(value);
      if (isNaN(n)) throw new Error(`Cannot cast "${value}" to number`);
      return n;
    }
    case 'boolean': {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
      throw new Error(`Cannot cast "${value}" to boolean`);
    }
    case 'json': {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`Cannot cast "${value}" to JSON`);
      }
    }
    default:
      throw new Error(`Unknown cast type: ${type}`);
  }
}

export function castEnv(
  env: Record<string, string>,
  fields: CastField[]
): CastResult {
  const casted: Record<string, unknown> = { ...env };
  const errors: CastError[] = [];

  for (const { key, type } of fields) {
    if (!(key in env)) continue;
    try {
      casted[key] = castValue(env[key], type);
    } catch (err) {
      errors.push({
        key,
        value: env[key],
        expectedType: type,
        message: (err as Error).message,
      });
    }
  }

  return { casted, errors };
}
